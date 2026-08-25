'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion, useTier, PARTICLES } from '@/lib/motion';
import { burstConfetti } from './brand/Confetti';
import { Scribble } from './brand/Marks';
import { Frame } from './Frame';
import styles from './BrandStory.module.css';

const WORDS = ['Serious.', 'Stiff.', 'Boring.'];

/**
 * The argument, made typographically — and then made again by the design.
 *
 * "NOT" holds still while the accusation rolls beneath it, the scribble crosses
 * out the NOT, and the sentence turns into the brand.
 *
 * The section performs what it argues. While the accusations run, a flat sheet
 * of cold Azul covers the entire frame: no photography, no colour, type locked
 * to the centre line with nothing else in it. It IS serious, stiff and boring.
 * The strike lands and the sheet is DRAWN OFF — lifted away on a curved edge,
 * like a cloth pulled from a table — revealing the warm ground and a wall of
 * photographs of people already mid-evening underneath. Confetti fires on the
 * same frame.
 *
 * The reveal is deliberately not a crossfade. A fade says "here is some other
 * content". Pulling the sheet off says the rules were covering something.
 */

/** The turn: where the sheet comes off. */
const TURN_FROM = 0.6;
const TURN_TO = 0.82;

/** The payoff: people, tables, the evening already underway. */
const PHOTOS = [
  {
    src: '/photography/range-cafe-01.png',
    alt: 'The full LIBRE range on a café table by the sea, string lights overhead.',
    brief: 'The range on a café table by the sea.',
    ratio: '4 / 3',
    rotate: -3,
    className: 'photoA',
  },
  {
    src: '/photography/gold-pearl-social-01.png',
    alt: 'Gold Pearl on a restaurant table with friends laughing behind it.',
    brief: 'Gold Pearl on a restaurant table, laughter behind.',
    ratio: '3 / 4',
    rotate: 4.5,
    className: 'photoB',
  },
  {
    src: '/photography/sparkling-white-social-01.png',
    alt: 'Two people talking across a café table, Sparkling White and two glasses between them.',
    brief: 'Two people mid-conversation, Sparkling White between them.',
    ratio: '3 / 4',
    rotate: -6,
    className: 'photoC',
  },
] as const;

export function BrandStory() {
  const track = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLUListElement>(null);
  const tier = useTier();

  useEffect(() => {
    const el = track.current;
    const list = roll.current;
    if (!el || !list) return;

    if (prefersReducedMotion()) {
      gsap.set(list, { yPercent: 0 });
      gsap.set(el.querySelectorAll('[data-cover]'), { yPercent: -110 });
      return;
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      /* Confetti is a reward, never ambience — so it fires once, on the frame
         the sheet comes off, and only when scrolling into the turn. */
      let popped = false;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const past = self.progress > TURN_FROM + 0.05;
            if (past && !popped && self.direction === 1) {
              popped = true;
              burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.42, {
                count: Math.round(PARTICLES[tier] * 0.9),
                power: 1.05,
                spread: 1.2,
              });
            }
            if (self.progress < TURN_FROM - 0.05) popped = false;
          },
        },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      /*
       * Beat timing.
       * ----------------------------------------------------------------------
       * Each accusation needs an equal beat to land. Hand-placing the rolls
       * previously gave "Serious." 26% of the timeline and "Stiff." only 9% —
       * about a third of a viewport — so the second and third words flicked
       * past almost unseen while the first sat there.
       *
       * The schedule is derived from WORDS instead, so every word gets the
       * same dwell and adding a fourth cannot silently squeeze the others.
       */
      const SEQUENCE_END = 0.58;
      const ROLL = 0.045;
      const slot = SEQUENCE_END / WORDS.length;

      /*
       * yPercent is a share of the ELEMENT's own height, and the element here
       * is the whole list — WORDS.length lines tall. One line is therefore
       * 100/WORDS.length percent, not 100.
       */
      const LINE = 100 / WORDS.length;

      WORDS.forEach((_, i) => {
        if (i === 0) return;
        tl.to(list, { yPercent: -LINE * i, duration: ROLL, ease: 'power3.inOut' }, slot * i);
      });

      // NOT gets crossed out …
      tl.fromTo(
        q('[data-strike]'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.06 },
        SEQUENCE_END,
      );

      /*
       * … and the sheet is pulled off. It leaves upward on its curved edge, so
       * the photographs underneath are uncovered from the bottom of the frame
       * up — the same direction a glass fills.
       */
      tl.to(
        q('[data-cover]'),
        { yPercent: -112, duration: TURN_TO - TURN_FROM, ease: 'power2.inOut' },
        TURN_FROM,
      );

      // the sentence turns
      tl.to(q('[data-negative]'), { opacity: 0, yPercent: -26, duration: 0.05 }, TURN_FROM + 0.04);
      tl.fromTo(
        q('[data-positive]'),
        { opacity: 0, yPercent: 40, scale: 0.94 },
        { opacity: 1, yPercent: 0, scale: 1, duration: 0.09, ease: 'back.out(1.4)' },
        TURN_FROM + 0.13,
      );
      /* yPercent, not y: the element is already centred with translateX(-50%)
         and GSAP would drop that if it wrote a fresh transform from `y`. */
      tl.fromTo(
        q('[data-closing]'),
        { opacity: 0, yPercent: 40 },
        { opacity: 1, yPercent: 0, duration: 0.07 },
        TURN_TO + 0.04,
      );

      /* The photographs settle as they are uncovered, then keep breathing. */
      q('[data-photo]').forEach((node, i) => {
        tl.fromTo(
          node,
          { scale: 1.1, yPercent: 6 },
          { scale: 1, yPercent: 0, duration: 0.2, ease: 'power2.out' },
          TURN_FROM + 0.03 + i * 0.03,
        );
        tl.to(node, { yPercent: i % 2 ? -5 : 5, duration: 0.2, ease: 'none' }, TURN_TO);
      });

      return () => ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, [tier]);

  return (
    <div ref={track} className={styles.track} data-theme="rouge" id="story">
      <div className={styles.stage}>
        {/* Underneath everything: the evening that was there all along. */}
        <div className={styles.photos}>
          {PHOTOS.map((p) => (
            <div key={p.src} className={`${styles.photo} ${styles[p.className]}`} data-photo>
              <Frame brief={p.brief} src={p.src} alt={p.alt} ratio={p.ratio} rotate={p.rotate} />
            </div>
          ))}
        </div>

        {/* Keeps the headline off the faces once the sheet is gone. */}
        <div className={styles.scrim} aria-hidden="true" />

        {/* The sheet. Covers the lot until the strike lands. */}
        <div className={styles.cover} data-cover aria-hidden="true" />

        <div className={styles.words}>
          <div data-negative className={styles.negative}>
            <span className={`display display--xl ${styles.not}`}>
              Not
              <Scribble kind="slash" className={styles.strike} data-strike />
            </span>
            <div className={styles.rollWindow}>
              <ul ref={roll} className={styles.roll}>
                {WORDS.map((word) => (
                  <li key={word} className="display display--xl">{word}</li>
                ))}
              </ul>
            </div>
          </div>

          <p data-positive className={`display display--xl ${styles.positive}`}>
            Just
            <br />
            LIBRE.
          </p>
        </div>

        <p data-closing className={`body body--wide ${styles.closing}`}>
          Wine picked up a lot of rules on its way here. Which glass, which year,
          which face to make. We kept the part everyone actually came for.
        </p>
      </div>
    </div>
  );
}
