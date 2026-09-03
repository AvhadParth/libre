'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import type { ThemeName } from '@/lib/products';
import { ACTS, type ActKind } from '@/lib/world-acts';
import { Arrow, Bubbles, ConfettiMark, Glass, Scribble } from './brand/Marks';
import styles from './WorldActs.module.css';

/**
 * POP → POUR → FEEL → SHARE → CELEBRATE, one act each.
 *
 * These five verbs are named in the brand guidelines as the interaction
 * language of the whole site; until now this page gave them a five-item list
 * with an icon each. They are the only thing on /world that no other page also
 * says, so they get the page.
 *
 * Each act is a sticky stage on its own scroll length, and the motion enacts
 * the verb rather than decorating it — the glass actually fills on POUR, the
 * bottles actually pass along on SHARE. Sticky, not ScrollTrigger's pin: a pin
 * re-parents its element into a spacer and breaks React's unmount, which is
 * what killed navigation out of this kind of page before.
 */


/** The range, for the SHARE act — real cut-outs, passed along a line. */
const PASSED = [
  'sparkling-white',
  'sparkling-rose',
  'sauvignon-blanc-white',
  'merlot-red',
  'gold-pearl',
];

function Act({
  kind,
  verb,
  line,
  theme,
  index,
}: {
  kind: ActKind;
  verb: string;
  line: string;
  theme: ThemeName;
  index: number;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.dataset.static = 'true';
      return;
    }
    el.dataset.animated = 'true';

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      /* The words arrive the same way in every act; only the art differs. */
      tl.fromTo(q('[data-verb]'), { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.04);
      tl.fromTo(q('[data-line]'), { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.12);

      if (kind === 'pop') {
        /* Out, fast, and it does not come back — a pop is not a loop. */
        tl.fromTo(q('[data-piece]'),
          { scale: 0, rotate: 0, xPercent: 0, yPercent: 0, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)',
            /* Eight directions out of the centre, so it reads as a burst
               rather than as four clumps. */
            xPercent: (i: number) => [-420, 380, -300, 440, -140, 200, -520, 90][i % 8],
            yPercent: (i: number) => [-260, -300, 240, 170, -380, 300, 60, -140][i % 8],
            rotate: (i: number) => [-40, 35, -25, 50, -60, 20, 15, -50][i % 8],
            stagger: 0.012,
          }, 0.06);
      }

      if (kind === 'pour') {
        /* The glass actually fills. The mark is drawn full and revealed from
           the bottom, so the surface rises with the scroll. */
        tl.fromTo(q('[data-fill]'),
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(6% 0% 0% 0%)', duration: 0.5, ease: 'power1.inOut' }, 0.14);
      }

      if (kind === 'feel') {
        tl.fromTo(q('[data-bubble]'),
          { yPercent: 40, opacity: 0, scale: 0.7 },
          { yPercent: -40, opacity: 1, scale: 1, duration: 0.62, stagger: 0.05, ease: 'none' }, 0.08);
      }

      if (kind === 'share') {
        /* Passed along the table, left to right. */
        tl.fromTo(q('[data-passed]'),
          { xPercent: 34, opacity: 0 },
          { xPercent: -34, opacity: 1, duration: 0.66, stagger: 0.035, ease: 'none' }, 0.06);
      }

      if (kind === 'celebrate') {
        tl.fromTo(q('[data-mark]'),
          { scale: 0.4, opacity: 0, rotate: -18 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.24, stagger: 0.05, ease: 'back.out(2)' }, 0.14);
        tl.fromTo(q('[data-cta]'),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.42);
      }
    }, el);

    return () => ctx.revert();
  }, [kind]);

  return (
    <section ref={root} className={styles.act} data-theme={theme} data-kind={kind}>
      <div className={styles.stage}>
        <p className={styles.index}>{String(index + 1).padStart(2, '0')}</p>

        <h2 className={`display ${styles.verb}`} data-verb>
          {verb}
        </h2>
        <p className={styles.line} data-line>
          {line}
        </p>

        <div className={styles.art} aria-hidden="true">
          {kind === 'pop' &&
            Array.from({ length: 8 }, (_, i) => (
              <ConfettiMark key={i} className={styles.piece} data-piece />
            ))}

          {kind === 'pour' && (
            <div className={styles.glassWrap}>
              <Glass className={styles.glassGhost} level={0} />
              <span className={styles.glassFill} data-fill>
                <Glass level={1} liquid="var(--sol)" />
              </span>
            </div>
          )}

          {kind === 'feel' &&
            Array.from({ length: 5 }, (_, i) => (
              <Bubbles key={i} className={styles.bubble} data-bubble seed={i + 2} count={5} />
            ))}

          {kind === 'share' && (
            <div className={styles.passRow}>
              {PASSED.map((slug) => (
                <img
                  key={slug}
                  className={styles.passed}
                  data-passed
                  src={`/photography/shelf/${slug}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          )}

          {kind === 'celebrate' && (
            <>
              <Scribble kind="wave" className={`${styles.mark} ${styles.markA}`} data-mark />
              <ConfettiMark className={`${styles.mark} ${styles.markB}`} data-mark />
              <Scribble kind="circle" className={`${styles.mark} ${styles.markC}`} data-mark />
            </>
          )}
        </div>

        {kind === 'celebrate' && (
          <div className={styles.cta} data-cta>
            <Link href="/wine#shop" className="btn btn--lg btn--accent" data-cursor="LET'S POUR">
              Pick a bottle <Arrow className="btn__arrow" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function WorldActs() {
  return (
    <>
      {ACTS.map((act, i) => (
        <Act key={act.kind} {...act} index={i} />
      ))}
    </>
  );
}

