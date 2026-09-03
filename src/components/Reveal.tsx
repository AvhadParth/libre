'use client';

import { createElement, useRef, type ElementType, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsoLayoutEffect, prefersReducedMotion } from '@/lib/motion';

type Variant = 'rise' | 'lines' | 'mask' | 'scale' | 'slide';

/**
 * The one scroll-reveal primitive. Content is visible by default and only
 * hidden once JS confirms it can animate it back in — no-JS and reduced-motion
 * users never lose a single word.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  variant = 'rise',
  delay = 0,
  stagger = 0.075,
  start = 'top 88%',
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  stagger?: number;
  start?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // Elegant, immediate, no travel.
      const ctx = gsap.context(() => {
        gsap.fromTo(el, { opacity: 0 }, {
          opacity: 1, duration: 0.5, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 96%', once: true },
        });
      }, el);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const targets =
        variant === 'lines'
          ? (gsap.utils.toArray<HTMLElement>(el.children).length
              ? gsap.utils.toArray<HTMLElement>(el.children)
              : [el])
          : [el];

      /*
       * The slide's resting offset has to fit the screen it starts on. At -48px
       * on a 390px phone the element begins outside the viewport, which widens
       * the document until it reveals.
       */
      const slideFrom = Math.min(48, Math.round(window.innerWidth * 0.05));

      const from: gsap.TweenVars =
        variant === 'mask'
          ? { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }
          : variant === 'scale'
            ? { opacity: 0, scale: 1.08, filter: 'blur(6px)' }
            : variant === 'slide'
              ? { opacity: 0, x: -slideFrom }
              : { opacity: 0, y: 44 };

      const to: gsap.TweenVars =
        variant === 'mask'
          ? { clipPath: 'inset(0% 0% 0% 0%)', y: 0 }
          : variant === 'scale'
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : variant === 'slide'
              ? { opacity: 1, x: 0 }
              : { opacity: 1, y: 0 };

      gsap.fromTo(targets, from, {
        ...to,
        duration: 1.25,
        delay,
        stagger,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [variant, delay, stagger, start]);

  return createElement(Tag, { ref, className }, children);
}

/** Refresh ScrollTrigger after route-level layout changes (images, fonts). */
export const refreshScroll = () => ScrollTrigger.refresh();
