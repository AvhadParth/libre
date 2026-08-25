'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { BRAND } from '@/lib/content-config';
import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { Marquee } from './Marquee';
import { Scribble } from './brand/Marks';
import styles from './MeetLibre.module.css';

/**
 * The editorial introduction — shown rather than explained.
 *
 * The four brand values each ride on a photograph instead of sitting in a row
 * of copy underneath one. Every image arrives in greyscale and resolves into
 * full colour as it passes, one after another: the same "coming alive" the
 * vocabulary wall had, moved off the type and onto the pictures, so the section
 * argues with images rather than with paragraphs.
 *
 * Typography follows the guidelines strictly here. Chantal appears once, on the
 * section heading; the values, their lines and the standfirst are all Avenir,
 * which is what the guidelines specify for everything that is not a headline.
 */

/**
 * One photograph per value, chosen so nothing repeats what the section above
 * already used. Order matches BRAND.values.
 */
const SHOTS = [
  {
    src: '/photography/range-bubbles-01.png',
    alt: 'All five LIBRE bottles arranged on overlapping circles of brand colour.',
  },
  {
    src: '/photography/sparkling-rose-beach-01.png',
    alt: 'Sparkling Rosé and a filled glass on a beach at sunset.',
  },
  {
    src: '/photography/range-table-02.png',
    alt: 'The LIBRE range on a dark marble table, glasses and silk laid ready.',
  },
  {
    src: '/photography/sparkling-white-beach-01.png',
    alt: 'Sparkling White in a net bag on sand beside a poured glass.',
  },
] as const;

export function MeetLibre() {
  const gallery = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = gallery.current;
    if (!el) return;

    const shots = Array.from(el.querySelectorAll<HTMLElement>('[data-shot]'));
    if (!shots.length) return;

    if (prefersReducedMotion()) {
      shots.forEach((s) => { s.style.filter = 'none'; });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          /* A long run so the four resolve one at a time rather than together
             in the half-screen it takes the row to enter. */
          start: 'top 92%',
          end: 'bottom 46%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      shots.forEach((shot, i) => {
        tl.to(
          shot,
          { filter: 'grayscale(0) contrast(1) saturate(1)', duration: 0.22 },
          (i / shots.length) * 0.74,
        );
      });

      return () => ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <Themed theme="cream" id="meet" className={styles.section}>
      <div className={`shell ${styles.head}`}>
        <Reveal variant="mask">
          <h2 className={`display display--l ${styles.title}`}>
            Meet{' '}
            <span className="marked">
              LIBRE.
              <Scribble kind="underline" />
            </span>
          </h2>
        </Reveal>

        {/* The best line in the section, promoted to carry it. */}
        <Reveal delay={0.1}>
          <p className={`lede ${styles.standfirst}`}>
            The table. The noise. The second bottle. That was always the good bit.
          </p>
        </Reveal>
      </div>

      <ol ref={gallery} className={`shell ${styles.gallery}`}>
        {BRAND.values.map((value, i) => (
          <li key={value.name} className={styles.cell}>
            <Reveal delay={i * 0.06} variant="scale">
              <figure className={styles.figure}>
                <div className={styles.shot} data-shot>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SHOTS[i].src} alt={SHOTS[i].alt} loading="lazy" decoding="async" />
                </div>
                <figcaption className={styles.caption}>
                  <span className={styles.no}>0{i + 1}</span>
                  <span className={styles.name}>
                    {value.name}
                    {value.sub ? <span className={styles.sub}>{value.sub}</span> : null}
                  </span>
                  <span className={styles.line}>{value.line}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ol>

      <Marquee
        items={['Pure joy', 'No occasion required', 'Wine without the rules', 'Just LIBRE']}
      />
    </Themed>
  );
}
