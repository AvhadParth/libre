'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { Scribble } from './brand/Marks';
import { Frame } from './Frame';
import styles from './BrandStory.module.css';

const WORDS = ['Serious.', 'Stiff.', 'Boring.'];

/**
 * The argument, made typographically.
 *
 * "NOT" holds still while the accusation rolls beneath it — then the scribble
 * crosses out the NOT and the sentence turns into the brand. One idea, one
 * mechanism, and a beat of stillness at the end.
 */
export function BrandStory() {
  const track = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    const list = roll.current;
    if (!el || !list) return;

    if (prefersReducedMotion()) {
      gsap.set(list, { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
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
       * ROLL is the transition itself; the remainder of each slot is the beat
       * the word actually holds still for.
       */
      const SEQUENCE_END = 0.62; // the roll owns the first ~62%, the turn the rest
      const ROLL = 0.045;
      const slot = SEQUENCE_END / WORDS.length;

      /*
       * yPercent is a share of the ELEMENT's own height, and the element here
       * is the whole list — WORDS.length lines tall. One line is therefore
       * 100/WORDS.length percent, not 100. Rolling by a flat -100% per step
       * jumped the list clear past its last item and left the window empty.
       */
      const LINE = 100 / WORDS.length;

      WORDS.forEach((_, i) => {
        if (i === 0) return;
        tl.to(
          list,
          { yPercent: -LINE * i, duration: ROLL, ease: 'power3.inOut' },
          slot * i,
        );
      });

      // NOT gets crossed out …
      tl.fromTo(
        q('[data-strike]'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.07 },
        SEQUENCE_END + 0.02,
      );
      // … and the sentence turns
      tl.to(q('[data-negative]'), { opacity: 0, yPercent: -30, duration: 0.07 }, 0.76);
      tl.fromTo(
        q('[data-positive]'),
        { opacity: 0, yPercent: 45 },
        { opacity: 1, yPercent: 0, duration: 0.09 },
        0.8,
      );
      tl.fromTo(
        q('[data-closing]'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.07 },
        0.9,
      );

      // Photography drifts at its own pace behind the words
      q('[data-drift]').forEach((node, i) => {
        tl.fromTo(
          node,
          { yPercent: 22 * (i % 2 ? 1 : -1) },
          { yPercent: -22 * (i % 2 ? 1 : -1), duration: 1 },
          0,
        );
      });

      return () => ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={track} className={styles.track} data-theme="rouge" id="story">
      <div className={styles.stage}>
        <div className={`${styles.photo} ${styles.photoA}`} data-drift>
          <Frame
            brief="Hands mid-conversation across a crowded table, glasses catching low light. Candid, slightly blurred, warm."
            tone="mist" ratio="3 / 4" rotate={-4}
          />
        </div>
        <div className={`${styles.photo} ${styles.photoB}`} data-drift>
          <Frame
            brief="Overhead: an unglamorous kitchen counter, a half-poured glass, someone laughing out of frame."
            tone="sol" ratio="1 / 1" rotate={5}
          />
        </div>

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
