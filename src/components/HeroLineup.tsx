'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion, useTier } from '@/lib/motion';
import { lineup, setLineupPointer } from '@/three/lineup';
import { LINEUP, hasWebGL, LineupScene } from '@/three/LineupScene';
import type { BottleId } from '@/three/BottleModel';
import { products, type ThemeName } from '@/lib/products';
import { Logo } from './brand/Logo';
import { BubbleField } from './brand/BubbleField';
import { Arrow } from './brand/Marks';
import { BottleFallback } from '@/three/BottleFallback';
import styles from './HeroLineup.module.css';

/**
 * The opening act: the range, standing in the brand's own bubble field.
 *
 * The supplied bottle models are single fused meshes — no separable cork, no
 * liquid volume — so this hero does not try to open or pour anything. It works
 * them as objects instead: the row slides, each bottle turns, and the ground
 * takes that bottle's colour. One scroll per product, and the colour system
 * doing the talking. Each ground is the theme the catalogue already assigns
 * that wine, so the hero cannot drift out of step with the product pages.
 */

/** Each model, paired with the product it actually is. */
const SLOTS: { id: BottleId; slug: string; theme: ThemeName }[] = [
  { id: 'merlot', slug: 'merlot-red', theme: 'rouge' },
  { id: 'sauvignon', slug: 'sauvignon-blanc-white', theme: 'vine' },
  { id: 'rose', slug: 'sparkling-rose', theme: 'mist' },
  { id: 'sparkling', slug: 'sparkling-white', theme: 'sol' },
];

/*
 * Scroll shape.
 * ---------------------------------------------------------------------------
 * The row advances across the first (1 - END_HOLD) of the track, then HOLDS on
 * the last bottle for the remainder. Without that hold the third bottle is
 * still sliding into place at the exact moment the section starts leaving the
 * viewport, so it never gets a beat of its own — you scroll past it rather than
 * arrive at it. The hold gives it a full stop before the page moves on.
 */
const END_HOLD = 0.24;

/** Track progress -> continuous bottle index, with the tail held. */
const focusFor = (progress: number, last: number) =>
  Math.min(1, progress / (1 - END_HOLD)) * last;

/** The track progress at which a given bottle is dead centre. */
const trackAtIndex = (index: number, last: number) =>
  (index / last) * (1 - END_HOLD);

/**
 * Scroll settles on a bottle rather than between two.
 *
 * One stop per bottle, plus the end of the hold so the last one can be scrolled
 * away from — without that final stop the snap would pull you back onto the
 * third bottle every time you tried to leave the section.
 */
const snapPoints = (last: number) => [
  ...Array.from({ length: last + 1 }, (_, i) => trackAtIndex(i, last)),
  1,
];

const CARDS = SLOTS.map((slot) => {
  const product = products.find((p) => p.slug === slot.slug)!;
  return { ...slot, product };
});

export function HeroLineup() {
  const reduced = useReducedMotion();
  const tier = useTier();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  /** Index of the snap stop the hero last came to rest on. */
  const settled = useRef(0);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const live = webgl === true && !reduced;

  /* The bottle leans toward the pointer. */
  useEffect(() => {
    if (!live) return;
    const onMove = (e: PointerEvent) => {
      setLineupPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [live]);

  /* ---------------------------------------------------------------- scroll */
  useEffect(() => {
    const el = track.current;
    const st = stage.current;
    if (!el || !st || !live) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(st);
      const last = CARDS.length - 1;

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        snap: {
          /*
           * One gesture, one bottle.
           *
           * Snapping to the nearest stop is not enough: a normal wheel flick
           * carries more than the distance between two stops, so it sails past
           * a bottle and lands on the one after — you never see the middle of
           * the range. This clamps every settle to a single step from wherever
           * the last one landed, in whichever direction the gesture went, so
           * the range can only ever be walked one bottle at a time.
           */
          snapTo: (value: number) => {
            const stops = snapPoints(last);
            const here = stops[settled.current];
            const moved = value - here;
            if (Math.abs(moved) < 1e-4) return here;

            const dir = moved > 0 ? 1 : -1;
            const next = Math.max(0, Math.min(stops.length - 1, settled.current + dir));
            if (next === settled.current) return here;

            /*
             * A bottle has to be scrolled AWAY from, not merely nudged.
             * Committing on any movement made the hero feel like it was running
             * ahead of the gesture — the smallest wheel tick and the bottle was
             * already leaving. Anything short of COMMIT of the way to the next
             * stop settles back onto the bottle you are on, so each one holds
             * until you actually decide to move.
             */
            const COMMIT = 0.4;
            const travelled = Math.abs(moved) / Math.abs(stops[next] - here);
            return travelled >= COMMIT ? stops[next] : here;
          },
          duration: { min: 0.45, max: 1.0 },
          delay: 0.06,
          ease: 'power2.out',
          onComplete: (self) => {
            const stops = snapPoints(last);
            let nearest = 0;
            stops.forEach((stop, i) => {
              if (Math.abs(stop - self.progress) < Math.abs(stops[nearest] - self.progress)) {
                nearest = i;
              }
            });
            settled.current = nearest;
          },
        },
        onUpdate: (self) => {
          lineup.progress = self.progress;
          lineup.focus = focusFor(self.progress, last);

          // The ground takes the colour of whichever bottle is in front.
          const i = Math.round(lineup.focus);
          const theme = CARDS[Math.max(0, Math.min(last, i))].theme;
          if (el.dataset.theme !== theme) el.dataset.theme = theme;
        },
      });

      /* The field drifts, each depth band at its own rate, so the bubbles read
         as a volume the bottles stand inside rather than a flat backdrop. */
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
        defaults: { ease: 'none' },
      });
      ([[0, -26, 1.18], [1, -15, 1.1], [2, -8, 1.04]] as const).forEach(
        ([depth, rise, grow]) => {
          tl.fromTo(
            q(`[data-bubble][data-depth="${depth}"]`),
            { yPercent: 0, scale: 1 },
            { yPercent: rise, scale: grow, duration: 1 },
            0,
          );
        },
      );

      /* Copy crossfades between bottles, in step with the row. */
      /* Card timings live on the same curve as the row, so the copy and the
         bottle it belongs to arrive together and hold together. */
      CARDS.forEach((_, i) => {
        const at = trackAtIndex(i, last);
        const card = q(`[data-card="${i}"]`);
        if (i === 0) {
          gsap.set(card, { opacity: 1, yPercent: 0 });
        } else {
          tl.fromTo(card, { opacity: 0, yPercent: 28 },
            { opacity: 1, yPercent: 0, duration: 0.09 }, Math.max(0, at - 0.09));
        }
        if (i < last) {
          tl.to(card, { opacity: 0, yPercent: -22, duration: 0.09 },
            Math.min(0.98, at + 0.06));
        }
      });

      /* The wordmark recedes as the range takes over. */
      tl.fromTo(q('[data-wordmark]'),
        { opacity: 1, scale: 1 }, { opacity: 0.16, scale: 0.94, duration: 1 }, 0);
      tl.to(q('[data-cue]'), { opacity: 0, duration: 0.1 }, 0.04);
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [live]);

  /* Layout changes height once WebGL is known — re-measure everything below. */
  useEffect(() => {
    if (webgl === null) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [webgl]);

  if (webgl === null) return <div className={styles.boot} aria-hidden="true" />;

  /* ------------------------------------------- reduced motion / no WebGL -- */
  if (!live) {
    return (
      <section className={styles.static} data-theme="cream" aria-labelledby="hero-title">
        <BubbleField className={styles.bubbles} />
        <div className={`shell ${styles.staticInner}`}>
          <h1 id="hero-title" className={styles.wordmark}>
            <Logo className={styles.wordmarkArt} decorative />
            <span className="sr-only">LIBRE — wine without the rules</span>
          </h1>
          <p className="lede">Wine. Without the rules.</p>
          <BottleFallback className={styles.staticArt} />
          <ul className={styles.staticList}>
            {CARDS.map(({ product }) => (
              <li key={product.slug}>
                <Link href={`/wine/${product.slug}`} className="link">
                  {product.name} — {product.variant}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/wine" className="btn btn--lg">
            See the range <span className="btn__arrow"><Arrow /></span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={track}
      className={styles.track}
      data-theme="rouge"
      aria-labelledby="hero-title"
    >
      <div ref={stage} className={styles.stage}>
        <BubbleField className={styles.bubbles} count={18} seed={11} />

        {/* Behind the range: the wordmark, at full height. */}
        <div className={styles.backType} data-wordmark>
          <h1 id="hero-title" className={styles.wordmark}>
            <Logo className={styles.wordmarkArt} decorative />
            <span className="sr-only">LIBRE — wine without the rules</span>
          </h1>
        </div>

        <LineupScene tier={tier} className={styles.canvas} />

        {/* In front: whichever bottle is currently standing forward. */}
        <div className={styles.cards}>
          {CARDS.map(({ product }, i) => (
            <article key={product.slug} className={styles.card} data-card={i}>
              <p className="eyebrow">{product.personality}</p>
              <h2 className={`display display--m ${styles.cardName}`}>
                {product.name}
              </h2>
              {product.variant ? (
                <p className={styles.cardVariant}>{product.variant}</p>
              ) : null}
              <Link href={`/wine/${product.slug}`} className={`btn ${styles.cardCta}`}>
                Meet it <span className="btn__arrow"><Arrow /></span>
              </Link>
            </article>
          ))}
        </div>

        <p className={styles.cue} data-cue>
          Scroll the range <Arrow className={styles.cueArrow} />
        </p>
      </div>
    </section>
  );
}
