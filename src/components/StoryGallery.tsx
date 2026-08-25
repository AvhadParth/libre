'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { stories } from '@/lib/stories';
import { prefersReducedMotion } from '@/lib/motion';
import { Scribble } from './brand/Marks';
import styles from './StoryGallery.module.css';

/**
 * The brand's world, travelling sideways.
 *
 * A film strip rather than a carousel: the panels run edge to edge at full
 * height with no cards, no gaps and no frames, so the reader travels THROUGH
 * the photography instead of past a row of thumbnails. Captions sit on the
 * image rather than beneath it, which is what keeps the images at full height.
 *
 * On a precise pointer with motion allowed the strip is driven by vertical
 * scroll — horizontal movement earns its place here because the content is a
 * sequence. Everywhere else it is a plain, snapping, swipeable scroller, which
 * is what a phone actually wants.
 */
export function StoryGallery() {
  const track = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLUListElement>(null);
  const [driven, setDriven] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)').matches;
    setDriven(wide && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = track.current;
    const strip = row.current;
    if (!driven || !el || !strip) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, strip.scrollWidth - window.innerWidth + 96);

      /*
       * Scroll pace.
       * ----------------------------------------------------------------------
       * Mapping the pin length to `distance()` alone moves the strip 1:1 with
       * the wheel, which put this section at ~160svh while every other pinned
       * act on the site runs 420–520svh. Six story cards then flew past in
       * about a third of the scroll their neighbours get, and the row read as
       * a swipe rather than a gallery.
       *
       * PACE stretches the pin without touching the travel: the strip still
       * moves exactly `distance()` px, it just takes PACE× as much scroll to
       * do it. The floor keeps short rows (few cards, wide viewport) from
       * collapsing into a flick.
       */
      const PACE = 1.9;
      const MIN_PIN = () => window.innerHeight * 2.6;
      const pin = () => Math.max(distance() * PACE, MIN_PIN());

      gsap.to(strip, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${pin()}`,
          scrub: 0.9,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Depth: cards drift at slightly different rates so the row has air in it.
      gsap.utils.toArray<HTMLElement>(strip.children).forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: i % 3 === 0 ? 34 : i % 3 === 1 ? -26 : 12 },
          {
            y: i % 3 === 0 ? -34 : i % 3 === 1 ? 26 : -12,
            ease: 'none',
            scrollTrigger: {
              trigger: el, start: 'top top', end: () => `+=${pin()}`,
              scrub: 1, invalidateOnRefresh: true,
            },
          },
        );
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [driven]);

  return (
    <section
      ref={track}
      className={`${styles.section} ${driven ? styles.pinned : ''}`}
      data-theme="vine"
      id="stories"
    >
      <header className={`shell ${styles.head}`}>
        <h2 className={`display display--m ${styles.title}`}>
          Our stories{' '}
          <span className="marked">
            don’t wait.
            <Scribble kind="underline" />
          </span>
        </h2>
        {/* Both lines are approved brand language from the guidelines. */}
        <p className={`body ${styles.standfirst}`}>
          They begin with a pour. {driven ? 'Keep scrolling.' : 'Swipe through.'}
        </p>
      </header>

      <div className={driven ? styles.viewport : styles.scroller}>
        <ul ref={row} className={styles.row}>
          {stories.map((story) => (
            <li key={story.id} className={styles.panel} data-span={story.span}>
              <figure className={styles.figure}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.image}
                  src={story.src}
                  alt={story.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className={styles.caption}>{story.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
