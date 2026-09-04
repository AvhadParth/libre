'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './ActFilm.module.css';

/**
 * The footage behind one act.
 *
 * Three things this has to get right, none of them obvious:
 *
 * It must never show black. The poster paints first and the video fades over it
 * once it can actually play, so an act entered fast looks finished rather than
 * empty.
 *
 * It must not run five loops at once. Each film only loads when its act is
 * close, and pauses the moment the act leaves — otherwise the page decodes four
 * videos continuously and eats battery for footage nobody is looking at.
 *
 * It must resolve. The film arrives heavily blurred and sharpens as the act
 * reaches the middle of the screen, so arriving at an act feels like focusing
 * on it. That is also what keeps the verb readable: the type is the only sharp
 * thing in the frame.
 */
export function ActFilm({ src, alt }: { src: string; alt: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  /* Data saver and reduced motion both get the poster and nothing else. */
  const [still, setStill] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setStill(prefersReducedMotion() || conn?.saveData === true);
  }, []);

  /* Load when the act is one screen away; play only while it is on screen. */
  useEffect(() => {
    const el = wrap.current;
    if (!el || still) return;

    const near = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLoad(true); near.disconnect(); } },
      { rootMargin: '100% 0px' },
    );
    near.observe(el);

    const playing = new IntersectionObserver(
      ([e]) => {
        const v = video.current;
        if (!v) return;
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.01 },
    );
    playing.observe(el);

    return () => { near.disconnect(); playing.disconnect(); };
  }, [still]);

  /* The focus pull, tied to the act's own passage through the viewport. */
  useEffect(() => {
    const el = wrap.current;
    if (!el || still) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { '--film-blur': '10px', '--film-scale': 1.08 },
        {
          '--film-blur': '3px',
          '--film-scale': 1.03,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') ?? el,
            start: 'top bottom',
            end: 'center center',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [still]);

  return (
    <div ref={wrap} className={styles.film} data-ready={ready || undefined} aria-hidden="true">
      {/* Always painted, so there is never a black frame. */}
      <img className={styles.poster} src={`/videos/${src}-poster.webp`} alt="" aria-hidden="true" />

      {!still && load && (
        <video
          ref={video}
          className={styles.video}
          src={`/videos/${src}.mp4`}
          poster={`/videos/${src}-poster.webp`}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={alt}
          onCanPlay={() => setReady(true)}
        />
      )}

      <span className={styles.scrim} />
    </div>
  );
}
