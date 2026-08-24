'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Celebration layer. Mounted once. Fired from anywhere via burstConfetti().
 * Confetti is a reward, never ambience — it only ever runs on a real action.
 */

type BurstOptions = { count?: number; spread?: number; power?: number };

let fireImpl: ((x: number, y: number, opts?: BurstOptions) => void) | null = null;

export function burstConfetti(x: number, y: number, opts?: BurstOptions) {
  fireImpl?.(x, y, opts);
}

/** Fires from the centre of an element — used by buttons and the cart. */
export function burstFrom(el: Element | null, opts?: BurstOptions) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burstConfetti(r.left + r.width / 2, r.top + r.height / 2, opts);
}

const COLOURS = ['#451326', '#003B2F', '#F9BDC9', '#FFC33C', '#002752'];
type Shape = 'rect' | 'dot' | 'ribbon';
const SHAPES: Shape[] = ['rect', 'dot', 'ribbon', 'dot'];

type Particle = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vrot: number; size: number; life: number; ttl: number;
  colour: string; shape: Shape; wobble: number;
};

export function ConfettiLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(48, now - (last || now));
      last = now;
      const f = dt / 16.667;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.life += dt;
        p.vy += 0.38 * f;          // gravity
        p.vx *= 1 - 0.012 * f;      // drag
        p.vy *= 1 - 0.006 * f;
        p.wobble += 0.09 * f;
        p.x += (p.vx + Math.sin(p.wobble) * 0.7) * f;
        p.y += p.vy * f;
        p.rot += p.vrot * f;

        const t = p.life / p.ttl;
        ctx.globalAlpha = t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1;
        ctx.fillStyle = p.colour;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.shape === 'dot') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'ribbon') {
          ctx.fillRect(-p.size * 0.16, -p.size * 0.75, p.size * 0.32, p.size * 1.5);
        } else {
          // Squash on rotation so flat confetti reads as physical, not as sprites
          ctx.fillRect(-p.size / 2, (-p.size / 2) * Math.cos(p.rot), p.size, p.size);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      particles = particles.filter((p) => p.life < p.ttl && p.y < window.innerHeight + 80);
      if (particles.length) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
    };

    fireImpl = (x, y, opts) => {
      if (prefersReducedMotion()) return;
      const narrow = window.innerWidth < 820;
      const count = Math.round((opts?.count ?? 70) * (narrow ? 0.45 : 1));
      const spread = opts?.spread ?? Math.PI * 1.35;
      const power = opts?.power ?? 1;

      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        const speed = (5 + Math.random() * 11) * power;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.34,
          size: 5 + Math.random() * 9,
          life: 0,
          ttl: 1500 + Math.random() * 1400,
          colour: COLOURS[(Math.random() * COLOURS.length) | 0],
          shape: SHAPES[(Math.random() * SHAPES.length) | 0],
          wobble: Math.random() * Math.PI * 2,
        });
      }
      if (particles.length > 700) particles = particles.slice(-700);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    return () => {
      fireImpl = null;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        pointerEvents: 'none', width: '100%', height: '100%',
      }}
    />
  );
}
