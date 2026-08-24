'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { Grape } from './brand/Marks';
import styles from './PageTransition.module.css';

/**
 * Moving between pages should feel like moving between rooms of the same world.
 *
 * A sheet of Tempranillo Rouge rises with a liquid leading edge, holds for the
 * length of the route change, then drains away downward. There is no spinner
 * and no white flash — the wine is the loading state.
 */
export function PageTransition() {
  const cover = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const busy = useRef(false);

  /* Drain away once the new route has painted. */
  useEffect(() => {
    const el = cover.current;
    if (!el || !busy.current) return;
    busy.current = false;

    gsap.set(el, { pointerEvents: 'none' });
    gsap.to(el, {
      yPercent: -102,
      borderBottomLeftRadius: '46% 30%',
      borderBottomRightRadius: '54% 26%',
      duration: 0.85,
      ease: 'expo.inOut',
      onComplete: () => gsap.set(el, { yPercent: 102, borderRadius: 0, visibility: 'hidden' }),
    });
  }, [pathname]);

  /* Intercept internal navigation so the exit can play before the route swaps. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');
      if (!href || target === '_blank' || anchor.hasAttribute('download')) return;
      if (!href.startsWith('/') || href.startsWith('/#')) return;
      if (href.split('#')[0] === pathname) return;
      if (prefersReducedMotion()) return; // let Next navigate plainly

      const el = cover.current;
      if (!el) return;

      event.preventDefault();
      busy.current = true;

      gsap.set(el, { visibility: 'visible', pointerEvents: 'auto', yPercent: 102 });
      gsap
        .timeline({ onComplete: () => router.push(href) })
        .fromTo(
          el,
          { yPercent: 102, borderTopLeftRadius: '52% 28%', borderTopRightRadius: '48% 32%' },
          { yPercent: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, duration: 0.72, ease: 'expo.inOut' },
        )
        .fromTo(
          el.querySelector(`.${styles.mark}`),
          { opacity: 0, scale: 0.5, rotate: -30 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' },
          '-=0.34',
        );
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname, router]);

  return (
    <div ref={cover} className={styles.cover} aria-hidden="true">
      <Grape className={styles.mark} />
    </div>
  );
}
