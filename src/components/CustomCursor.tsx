'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { usePointerFine, useReducedMotion } from '@/lib/motion';
import { Grape } from './brand/Marks';
import styles from './CustomCursor.module.css';

/**
 * The grape replaces the pointer.
 *
 * It trails with real inertia and squashes along its direction of travel, so it
 * behaves like an object with mass rather than a cursor decoration. Any element
 * can retitle it: `data-cursor="LET'S POUR"`.
 *
 * Precise pointers only. Touch and reduced-motion users keep the system cursor,
 * and every affordance it conveys is duplicated in visible UI.
 */
export function CustomCursor() {
  const fine = usePointerFine();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('has-custom-cursor');
    return () => document.body.classList.remove('has-custom-cursor');
  }, [enabled]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    if (!enabled || !wrap || !body) return;

    gsap.set(wrap, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(wrap, 'x', { duration: 0.42, ease: 'power3' });
    const yTo = gsap.quickTo(wrap, 'y', { duration: 0.42, ease: 'power3' });
    const rTo = gsap.quickTo(body, 'rotation', { duration: 0.5, ease: 'power3' });
    const sxTo = gsap.quickTo(body, 'scaleX', { duration: 0.5, ease: 'power3' });
    const syTo = gsap.quickTo(body, 'scaleY', { duration: 0.5, ease: 'power3' });

    let px = 0, py = 0, visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set(wrap, { x: e.clientX, y: e.clientY });
        gsap.to(wrap, { opacity: 1, duration: 0.3 });
      }
      xTo(e.clientX);
      yTo(e.clientY);

      // Stretch along travel, squash across it — grape physics.
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      px = e.clientX; py = e.clientY;
      const speed = Math.min(Math.hypot(dx, dy) / 26, 1);
      rTo((Math.atan2(dy, dx) * 180) / Math.PI);
      sxTo(1 + speed * 0.45);
      syTo(1 - speed * 0.3);
    };

    const INTERACTIVE = 'a,button,[role="button"],input,textarea,select,summary,[data-cursor]';

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(INTERACTIVE);
      if (!target) return;
      const text = target.getAttribute('data-cursor');
      setLabel(text ?? '');
      wrap.dataset.state = text ? 'label' : 'grow';
    };

    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as Element | null;
      if (to?.closest?.(INTERACTIVE)) return;
      setLabel('');
      wrap.dataset.state = 'idle';
    };

    const onLeave = () => gsap.to(wrap, { opacity: 0, duration: 0.25 });
    const onEnter = () => gsap.to(wrap, { opacity: 1, duration: 0.25 });
    const onDown = () => gsap.to(body, { scale: 0.74, duration: 0.22, ease: 'power2' });
    const onUp = () => gsap.to(body, { scale: 1, duration: 0.55, ease: 'elastic.out(1,0.55)' });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerout', onOut, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className={styles.cursor} data-state="idle" aria-hidden="true">
      <div ref={bodyRef} className={styles.body}>
        <Grape className={styles.grape} />
        <span className={styles.ring} />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
