'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const QUERY = '(prefers-reduced-motion: reduce)';

/** Live-tracked. Users toggling the OS setting get the calm site immediately. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

/** Coarse pointer / no hover — we drop the cursor and heavy hover choreography. */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return fine;
}

/**
 * Performance budget. Mobile and low-core machines get fewer particles, a
 * smaller 3D pixel ratio and no transmission-heavy glass.
 */
export type Tier = 'high' | 'medium' | 'low';

export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>('medium');
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const narrow = window.matchMedia('(max-width: 820px)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (narrow || coarse || cores <= 4 || mem <= 4) setTier(cores <= 2 ? 'low' : 'medium');
    else setTier('high');
  }, []);
  return tier;
}

export const PARTICLES: Record<Tier, number> = { high: 90, medium: 46, low: 20 };

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random so layouts never reshuffle between renders. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
