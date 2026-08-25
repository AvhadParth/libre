'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { Dots, Grape } from './brand/Marks';
import styles from './WhenSection.module.css';

/**
 * The occasion question, answered by burying it.
 *
 * Each answer lands in its own place, at its own angle, and none are cleared
 * away — by the end the screen is covered in reasons, which is the argument.
 * Then the last word takes the whole frame.
 *
 * The background makes the same argument in texture. The polka field starts
 * sparse and thickens with every answer that lands, so the frame crowds as the
 * question gets buried, then scatters when "Why wait?" arrives. The guidelines
 * describe the dots as a motif that scatters, floats and becomes a transition;
 * left at a flat 10% they were doing none of that.
 *
 * Type follows the guidelines: Chantal carries the two questions, which are the
 * headlines. The answers are Avenir — and the contrast is what gives "When?"
 * and "Why wait?" their weight.
 */

/*
 * Occasions in the order someone would actually think of them, each landing in
 * its own colour so the frame fills with the palette as well as with words.
 * Every tint clears AA on Sol Yellow at this size; the five used most clear it
 * outright rather than only at large-text sizes.
 */
const MOMENTS = [
  { word: 'Dinner.', tint: 'var(--rouge)' },
  { word: 'Weekend.', tint: 'var(--azul)' },
  { word: 'Friends.', tint: 'var(--vine)' },
  { word: 'Sunset.', tint: 'var(--rouge-lit)' },
  { word: 'Celebration.', tint: 'var(--azul-lit)' },
  { word: 'No reason.', tint: 'var(--vine)' },
];

/**
 * Three fixed densities stacked rather than one field being re-tiled. Animating
 * a <pattern>'s size means animating its width, height AND the circle's centre
 * in lockstep or the dots drift out of their cells; crossfading whole layers is
 * both cheaper and steadier.
 */
const FIELDS = [
  { size: 46, radius: 3.1 },
  { size: 30, radius: 2.7 },
  { size: 20, radius: 2.2 },
];

export function WhenSection() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      /* Each answer arrives in its own place. */
      q('[data-moment]').forEach((node, i) => {
        tl.fromTo(
          node,
          { opacity: 0, scale: 0.7, yPercent: 30 },
          { opacity: 1, scale: 1, yPercent: 0, duration: 0.05, ease: 'back.out(2)' },
          0.12 + i * 0.1,
        );
      });

      /* The field thickens behind them, a layer at a time. */
      q('[data-field="1"]').forEach((node) => {
        tl.to(node, { opacity: 0.14, duration: 0.16 }, 0.24);
      });
      q('[data-field="2"]').forEach((node) => {
        tl.to(node, { opacity: 0.16, duration: 0.16 }, 0.46);
      });

      tl.to(q('[data-ask]'), { opacity: 0.14, scale: 0.9, duration: 0.1 }, 0.62);
      tl.to(q('[data-moment]'), { opacity: 0.18, duration: 0.08 }, 0.76);

      /* … and scatters as the last word takes the frame. */
      tl.to(
        q('[data-field]'),
        { opacity: 0, scale: 1.5, duration: 0.12, ease: 'power2.out' },
        0.76,
      );
      tl.fromTo(
        q('[data-why]'),
        { opacity: 0, scale: 1.35 },
        { opacity: 1, scale: 1, duration: 0.1, ease: 'expo.out' },
        0.78,
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={track} className={styles.track} data-theme="sol">
      <div className={styles.stage}>
        {FIELDS.map((field, i) => (
          <Dots
            key={field.size}
            className={styles.dots}
            size={field.size}
            radius={field.radius}
            data-field={i}
            style={{ opacity: i === 0 ? 0.11 : 0 }}
          />
        ))}

        <h2 className={`display display--hero ${styles.ask}`} data-ask>
          When?
        </h2>

        <ul className={styles.moments}>
          {MOMENTS.map((moment, i) => (
            <li key={moment.word} className={styles.moment} data-moment data-i={i}>
              <span className={styles.word} style={{ color: moment.tint }}>
                {moment.word}
              </span>
              {i % 2 === 0 && <Grape className={styles.momentGrape} />}
            </li>
          ))}
        </ul>

        <p className={`display display--xl ${styles.why}`} data-why>
          Why wait?
        </p>
      </div>
    </div>
  );
}
