'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/motion';

let instance: Lenis | null = null;

/** Anchor + programmatic scrolling routes through Lenis so nothing fights it. */
export function scrollTo(target: string | HTMLElement, offset = 0) {
  if (instance) instance.scrollTo(target, { offset, duration: 1.4 });
  else if (typeof target !== 'string') target.scrollIntoView({ behavior: 'smooth' });
}

export function stopScroll() { instance?.stop(); }
export function startScroll() { instance?.start(); }

/**
 * Lenis drives the whole scroll narrative, and GSAP's ticker drives Lenis, so
 * pinned sections and scroll-linked 3D stay in perfect lockstep with the page.
 * Under prefers-reduced-motion we hand the scroll back to the browser entirely.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.7,
      wheelMultiplier: 1,
    });
    instance = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, [reduced]);

  return null;
}
