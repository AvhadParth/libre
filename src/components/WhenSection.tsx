'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { Dots, Grape } from './brand/Marks';
import styles from './WhenSection.module.css';

/* Occasions, in the order someone would actually think of them. */
const MOMENTS = ['Dinner.', 'Weekend.', 'Friends.', 'Sunset.', 'Celebration.', 'No reason.'];

/**
 * The occasion question, answered by burying it.
 *
 * Each answer lands in its own place, at its own angle, and none of them are
 * cleared away — by the end the screen is covered in reasons, which is the
 * argument. Then the last word takes the whole frame.
 */
export function WhenSection() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      q('[data-moment]').forEach((node, i) => {
        tl.fromTo(
          node,
          { opacity: 0, scale: 0.7, yPercent: 30 },
          { opacity: 1, scale: 1, yPercent: 0, duration: 0.05, ease: 'back.out(2)' },
          0.12 + i * 0.1,
        );
      });

      tl.to(q('[data-ask]'), { opacity: 0.14, scale: 0.9, duration: 0.1 }, 0.62);
      tl.to(q('[data-moment]'), { opacity: 0.18, duration: 0.08 }, 0.76);
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
        <Dots className={styles.dots} size={34} radius={3.2} />

        <h2 className={`display display--hero ${styles.ask}`} data-ask>
          When?
        </h2>

        <ul className={styles.moments}>
          {MOMENTS.map((moment, i) => (
            <li key={moment} className={styles.moment} data-moment data-i={i}>
              <span className="display display--m">{moment}</span>
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
