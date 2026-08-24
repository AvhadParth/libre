'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useReducedMotion, useTier } from '@/lib/motion';
import { paletteFor } from '@/lib/palette';
import { seq, setPointer } from '@/three/store';
import { BottleFallback } from '@/three/BottleFallback';
import styles from './ProductBottle.module.css';

/* The 3D is a separate chunk, fetched only once a page actually needs it. */
const BottleScene = dynamic(
  () => import('@/three/BottleScene').then((m) => m.BottleScene),
  { ssr: false, loading: () => <div className={styles.loading} aria-hidden="true" /> },
);

/**
 * The same bottle as the homepage, parked at its "presenting" mark instead of
 * being driven by a scroll track. It turns slowly and leans toward the pointer.
 */
export function ProductBottle({ slug, className }: { slug: string; className?: string }) {
  const reduced = useReducedMotion();
  const tier = useTier();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const palette = paletteFor(slug);

  useEffect(() => {
    let alive = true;
    import('@/three/BottleScene').then((m) => {
      if (alive) setWebgl(m.hasWebGL());
    });
    return () => { alive = false; };
  }, []);

  /* Hold the sequence at "upright, turning, unopened". */
  useEffect(() => {
    seq.progress = 0.22;
    return () => { seq.progress = 0; };
  }, [slug]);

  useEffect(() => {
    if (reduced || webgl !== true) return;
    const onMove = (e: PointerEvent) =>
      setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, webgl]);

  if (reduced || webgl === false) {
    return (
      <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
        <BottleFallback
          className={styles.still}
          glass={palette.glass}
          wine={palette.wine}
          foil={palette.foil}
        />
      </div>
    );
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {webgl === null ? (
        <div className={styles.loading} aria-hidden="true" />
      ) : (
        <BottleScene
          tier={tier}
          palette={palette}
          wine={palette.wine}
          className={styles.scene}
          fit="portrait"
        />
      )}
    </div>
  );
}
