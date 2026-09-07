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
import { mixOklab, oklabToRgb, readThemeColours, rgbToCss, type ThemeColours } from '@/lib/colour';
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

/**
 * What each model is, as a product. Keyed, not ordered — the order comes from
 * LINEUP, which the scene also renders from, so the bottle on screen and the
 * card beside it are always the same wine.
 */
const SLOT_BY_ID: Record<BottleId, { slug: string; theme: ThemeName }> = {
  merlot: { slug: 'merlot-red', theme: 'rouge' },
  sauvignon: { slug: 'sauvignon-blanc-white', theme: 'vine' },
  rose: { slug: 'sparkling-rose', theme: 'mist' },
  sparkling: { slug: 'sparkling-white', theme: 'sol' },
};

const SLOTS: { id: BottleId; slug: string; theme: ThemeName }[] = LINEUP.map((id) => ({
  id,
  ...SLOT_BY_ID[id],
}));

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

    /* Read what each theme resolves to, so the blend endpoints come from the
       stylesheet rather than a second copy of the palette in JS. */
    const themes = readThemeColours(CARDS.map((c) => c.theme));

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(st);
      const last = CARDS.length - 1;

      /*
       * The ground is a continuous function of scroll, not a stepped one.
       *
       * It used to flip data-theme at the halfway point and let a 900ms CSS
       * transition catch up. That reads as lag, because the colour is running
       * on its own clock: nothing moves until you cross the midpoint, then an
       * animation starts that knows nothing about where you have scrolled to,
       * racing the snap's own 0.45–1s settle. Two independent timers and a step
       * function.
       *
       * Here the colour IS the scroll position. `focus` sits between two
       * bottles, and the ground sits between their two themes by the same
       * fraction — mixed in OKLab so the middle of a blend looks like the
       * middle rather than dipping through mud. Nothing to fall behind.
       */
      const palette: ThemeColours[] = CARDS.map((c) => themes.get(c.theme)!);

      const paintGround = (focus: number) => {
        const f = Math.max(0, Math.min(last, focus));
        const i = Math.min(last, Math.floor(f));
        const j = Math.min(last, i + 1);
        const t = f - i;
        const a = palette[i];
        const b = palette[j];
        if (!a || !b) return;

        const bg = mixOklab(a.bg, b.bg, t);

        /*
         * How light the ground currently is, 0 → 1, for the bubble field to
         * crossfade its multiply and screen layers against. The window is the
         * empty band between the dark grounds (L ≈ 0.28–0.31) and the pale ones
         * (L ≈ 0.85), so the handover happens while passing between them and
         * never while resting on one.
         */
        const l = Math.min(1, Math.max(0, (bg[0] - 0.35) / 0.4));
        el.style.setProperty('--ground-l', l.toFixed(3));

        el.style.setProperty('--bg', rgbToCss(oklabToRgb(bg)));
        el.style.setProperty('--fg', rgbToCss(oklabToRgb(mixOklab(a.fg, b.fg, t))));
        el.style.setProperty('--accent', rgbToCss(oklabToRgb(mixOklab(a.accent, b.accent, t))));
        el.style.setProperty('--accent-2', rgbToCss(oklabToRgb(mixOklab(a.accent2, b.accent2, t))));

        /* data-theme still steps, but nothing colour-critical hangs off it any
           more — it is what the nav samples to pick its own contrast. */
        const nearest = CARDS[Math.round(f)].theme;
        if (el.dataset.theme !== nearest) el.dataset.theme = nearest;
      };

      paintGround(focusFor(0, last));

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
          paintGround(lineup.focus);
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
          gsap.set(card, { autoAlpha: 1, yPercent: 0 });
        } else {
          tl.fromTo(card, { autoAlpha: 0, yPercent: 28 },
            { autoAlpha: 1, yPercent: 0, duration: 0.09 }, Math.max(0, at - 0.09));
        }
        if (i < last) {
          tl.to(card, { autoAlpha: 0, yPercent: -22, duration: 0.09 },
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
