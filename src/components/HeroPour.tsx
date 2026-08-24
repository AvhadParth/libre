'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion, useTier } from '@/lib/motion';
import { seq, setPointer } from '@/three/store';
import { BottleFallback } from '@/three/BottleFallback';
import { burstConfetti } from './brand/Confetti';
import { playCue, stopCue } from '@/lib/sound';
import { Dots, Scribble } from './brand/Marks';
import { Logo } from './brand/Logo';
import { paletteFor } from '@/lib/palette';
import { scrollTo } from './SmoothScroll';
import styles from './HeroPour.module.css';

/* Three.js, drei and the scene are a separate chunk — the page paints its
   typography first and pulls the 3D in behind it. */
const BottleScene = dynamic(
  () => import('@/three/BottleScene').then((m) => m.BottleScene),
  { ssr: false },
);

/* The hero pours red, so the hero bottle is the Merlot — real glass, real
   capsule, real label artwork, straight from the packaging spec. */
const PALETTE = paletteFor('merlot-red');

/**
 * The opening act: arrive → look → POP → POUR → the liquid becomes the page.
 *
 * The whole sequence is one scroll track. A sticky stage holds the 3D and the
 * typography, and a single scrubbed timeline moves both, so the words and the
 * bottle are never out of step by even a frame.
 */
export function HeroPour() {
  const reduced = useReducedMotion();
  const tier = useTier();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const popped = useRef(false);
  const pouring = useRef(false);

  useEffect(() => {
    let alive = true;
    import('@/three/BottleScene').then((m) => {
      if (alive) setWebgl(m.hasWebGL());
    });
    return () => { alive = false; };
  }, []);

  const live = webgl === true && !reduced;

  /* ---- pointer parallax: the bottle leans toward you ---- */
  useEffect(() => {
    if (!live) return;
    const onMove = (e: PointerEvent) => {
      setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [live]);

  /* ---- the scroll sequence ---- */
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || !live) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          seq.progress = self.progress;
          // One celebration, at the exact moment the cork leaves.
          if (!popped.current && self.progress > 0.335 && self.direction === 1) {
            popped.current = true;
            playCue('pop', { volume: 0.6 });
            burstConfetti(window.innerWidth / 2, window.innerHeight * 0.34, {
              count: 54, power: 0.85,
            });
          }
          if (self.progress < 0.3) popped.current = false;

          /* The stream is audible for exactly as long as it is visible. */
          const flowing = self.progress > 0.5 && self.progress < 0.72;
          if (flowing !== pouring.current) {
            pouring.current = flowing;
            if (flowing) playCue('pour', { volume: 0.35, loop: true });
            else { stopCue('pour'); if (self.direction === 1) playCue('glass', { volume: 0.4 }); }
          }
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.55 },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0); // normalise the timeline to 0 → 1

      const q = gsap.utils.selector(stage);

      tl.to(q('[data-panel="intro"]'), { opacity: 0, yPercent: -22, duration: 0.12 }, 0.13);
      tl.fromTo(
        q('[data-panel="pop"]'),
        { opacity: 0, yPercent: 40, rotate: -4 },
        { opacity: 1, yPercent: 0, rotate: 0, duration: 0.07 },
        0.27,
      );
      tl.to(q('[data-panel="pop"]'), { opacity: 0, yPercent: -30, duration: 0.07 }, 0.42);
      tl.fromTo(
        q('[data-panel="pour"]'),
        { opacity: 0, yPercent: 40, rotate: 3 },
        { opacity: 1, yPercent: 0, rotate: 0, duration: 0.07 },
        0.45,
      );
      tl.to(q('[data-panel="pour"]'), { opacity: 0, duration: 0.06 }, 0.71);

      /* The wine itself becomes the next section. */
      tl.fromTo(
        q('[data-wipe]'),
        { yPercent: 104, borderTopLeftRadius: '58% 26%', borderTopRightRadius: '42% 22%' },
        { yPercent: 0, borderTopLeftRadius: '0% 0%', borderTopRightRadius: '0% 0%', duration: 0.18 },
        0.79,
      );
      tl.fromTo(
        q('[data-wipe-word]'),
        { opacity: 0, yPercent: 60 },
        { opacity: 1, yPercent: 0, duration: 0.08 },
        0.9,
      );
    }, track);

    return () => ctx.revert();
  }, [live]);

  /*
   * The hero changes height once it knows what it is.
   * --------------------------------------------------------------------
   * While the WebGL probe is in flight this component is a 100svh boot
   * block; it then becomes either a 520svh scroll track or a single static
   * screen. Every section below therefore MOVES, and any ScrollTrigger that
   * measured itself against the boot height is left pointing at the wrong
   * part of the page.
   *
   * That is not hypothetical: BrandStory was measuring start=813 (the boot
   * height) instead of 4228, so by the time you scrolled to it its timeline
   * had already run to the end and "Stiff." and "Boring." never appeared.
   *
   * Refreshing once the final layout has painted re-measures every trigger
   * against the real page.
   */
  useEffect(() => {
    if (webgl === null) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [webgl]);

  /* ------------------------------------------------------------------ */
  /* Reduced motion / no WebGL: the same story, told standing still.     */
  /* ------------------------------------------------------------------ */
  if (webgl === null) return <div className={styles.boot} aria-hidden="true" />;

  if (!live) {
    return (
      <section className={styles.static} data-theme="cream" aria-labelledby="hero-title">
        <div className={styles.staticInner}>
          <p className="eyebrow">Welcome to</p>
          <h1 id="hero-title" className="display display--xl">LIBRE.</h1>
          <p className="lede">Wine. Without the rules.</p>
          <BottleFallback className={styles.staticArt} />
          <ol className={styles.staticSteps}>
            <li><span className="display display--s">Pop it.</span></li>
            <li><span className="display display--s">Pour it.</span></li>
            <li><span className="display display--s">Let the stories do the rest.</span></li>
          </ol>
          <a href="#story" className="btn btn--lg">
            Keep going <span className="btn__arrow">↓</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} className={styles.track} data-theme="cream" aria-labelledby="hero-title">
      <div ref={stageRef} className={styles.stage}>
        <Dots className={styles.dots} size={30} radius={2.2} />
        {/* Behind the bottle: the name, at full height. The bottle stands in
            front of it, so nothing else may sit on this centre line. */}
        <div className={styles.backType} data-panel="intro">
          {/* The supplied hand-drawn wordmark at full height — the actual
              artwork, not the display face approximating it. */}
          <h1 id="hero-title" className={styles.wordmark}>
            <Logo variant="primary" className={styles.wordmarkArt} decorative />
            <span className="sr-only">LIBRE — wine without the rules</span>
          </h1>
        </div>

        <BottleScene tier={tier} palette={PALETTE} wine={PALETTE.wine} className={styles.canvas} />

        {/* In front of the bottle: the invitation. */}
        <div className={styles.front}>
          <p className={`eyebrow ${styles.welcome}`} data-panel="intro">Welcome to</p>

          <div className={styles.introCopy} data-panel="intro">
            <p className={`lede ${styles.tagline}`}>
              Wine. Without{' '}
              <span className="marked">
                the rules.
                <Scribble kind="underline" />
              </span>
            </p>
            <button
              type="button"
              className={styles.scrollCue}
              onClick={() => scrollTo(trackRef.current!, window.innerHeight * 0.9)}
              data-cursor="LET'S POUR"
            >
              Scroll to pour
              <span className={styles.cueArrow} aria-hidden="true">↓</span>
            </button>
          </div>

          <p className={`display display--xl ${styles.beat} ${styles.beatPop}`} data-panel="pop">
            Pop it.
          </p>
          <p className={`display display--xl ${styles.beat} ${styles.beatPour}`} data-panel="pour">
            Pour it.
          </p>
        </div>

        {/* The pour, finishing as a full-bleed colour change. */}
        <div className={styles.wipe} data-wipe data-theme="rouge">
          <p className={`display display--l ${styles.wipeWord}`} data-wipe-word>
            Let the stories<br />do the rest.
          </p>
        </div>
      </div>
    </section>
  );
}
