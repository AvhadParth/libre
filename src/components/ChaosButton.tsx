'use client';

import { useCallback, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion, useTier, PARTICLES } from '@/lib/motion';
import { burstFrom } from './brand/Confetti';
import { playCue } from '@/lib/sound';
import { Grape, Scribble } from './brand/Marks';
import styles from './ChaosButton.module.css';

/**
 * One unreasonable thing.
 *
 * It is loud for about a second and a half and then puts everything back
 * exactly where it was — which is the only reason it stays premium. The chaos
 * happens in its own fixed layer so it can never disturb a pinned section or
 * the scroll position underneath it.
 */
export function ChaosButton() {
  const section = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [spent, setSpent] = useState(false);
  const running = useRef(false);
  const tier = useTier();

  const unleash = useCallback(() => {
    if (running.current) return;
    running.current = true;
    setSpent(true);

    const root = section.current;
    const stageEl = layer.current;
    if (!root || !stageEl) return;

    if (prefersReducedMotion()) {
      running.current = false;
      return; // the verdict simply appears; nothing flies
    }

    playCue('burst', { volume: 0.6 });
    burstFrom(button.current, { count: Math.round(PARTICLES[tier] * 1.6), spread: Math.PI * 2, power: 1.25 });

    const marks = gsap.utils.toArray<HTMLElement>(stageEl.children);
    const q = gsap.utils.selector(root);

    const tl = gsap.timeline({
      onComplete: () => { running.current = false; },
    });

    // Everything the brand owns, briefly forgetting itself
    tl.set(stageEl, { visibility: 'visible' })
      .fromTo(
        marks,
        { xPercent: -50, yPercent: -50, scale: 0, rotate: 0, opacity: 0 },
        {
          x: () => gsap.utils.random(-window.innerWidth * 0.42, window.innerWidth * 0.42),
          y: () => gsap.utils.random(-window.innerHeight * 0.4, window.innerHeight * 0.4),
          scale: () => gsap.utils.random(0.5, 1.7),
          rotate: () => gsap.utils.random(-260, 260),
          opacity: 1,
          duration: 0.75,
          ease: 'expo.out',
          stagger: { each: 0.012, from: 'random' },
        },
        0,
      )
      .to(q(`.${styles.headline}`), {
        keyframes: [
          { skewX: 9, scaleY: 1.14, duration: 0.14 },
          { skewX: -7, scaleY: 0.92, duration: 0.14 },
          { skewX: 3, scaleY: 1.05, duration: 0.14 },
          { skewX: 0, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' },
        ],
      }, 0.04)
      .to(root, { '--chaos': 1, duration: 0.2, yoyo: true, repeat: 1 }, 0.05)
      // …and then putting itself away
      .to(marks, {
        x: 0, y: 0, scale: 0, opacity: 0,
        duration: 0.6, ease: 'power3.inOut',
        stagger: { each: 0.01, from: 'random' },
      }, 0.95)
      .set(stageEl, { visibility: 'hidden' })
      .fromTo(q('[data-verdict]'),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' },
        1.25);
  }, [tier]);

  const count = tier === 'high' ? 26 : tier === 'medium' ? 16 : 9;

  return (
    <section ref={section} className={styles.section} data-theme="mist">
      <div className={`shell ${styles.inner}`}>
        <h2 className={`display display--l ${styles.headline}`}>Feeling chaotic?</h2>

        <button
          ref={button}
          type="button"
          className={`btn btn--lg ${styles.trigger}`}
          onClick={unleash}
          data-cursor="GO ON"
        >
          {spent ? 'Again' : 'Yes'}
          <Grape className={styles.triggerGrape} />
        </button>

        <p className={`display display--m ${styles.verdict}`} data-verdict aria-live="polite">
          {spent ? (
            <>
              Yep.
              <br />
              That’s LIBRE.
            </>
          ) : (
            <span className="sr-only">Press the button to find out.</span>
          )}
        </p>
      </div>

      {/* The chaos lives here, fixed and inert, so nothing beneath it moves. */}
      <div ref={layer} className={styles.layer} aria-hidden="true">
        {Array.from({ length: count }, (_, i) =>
          i % 3 === 2 ? (
            <Scribble key={i} kind={i % 2 ? 'wave' : 'slash'} className={styles.flyWide} />
          ) : (
            <Grape key={i} className={styles.fly} />
          ),
        )}
      </div>
    </section>
  );
}
