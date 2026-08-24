'use client';

import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import type { Tier } from '@/lib/motion';
import { seq } from './store';
import { Studio } from './Studio';
import { Bottle, type Palette } from './Bottle';
import { PourStream } from './PourStream';
import { WineGlass } from './WineGlass';

export const hasWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/** How much world space the shot has to hold, per use. */
const FRAME = {
  /** Room for the tipped bottle and the glass beside it. */
  sequence: { h: 5.0, w: 3.6, y: 0.05 },
  /** One upright bottle, filling the crop. */
  portrait: { h: 3.9, w: 2.1, y: 0.1 },
} as const;

export type Fit = keyof typeof FRAME;

/**
 * Solves for camera distance instead of guessing breakpoints, so the shot is
 * correctly framed at every aspect ratio rather than at three of them.
 */
function FitCamera({ fit }: { fit: Fit }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const aspect = size.width / size.height;
    const half = THREE.MathUtils.degToRad(camera.fov) / 2;
    const { h, w, y } = FRAME[fit];
    seq.portrait = aspect < 0.85;
    camera.position.set(0, y, Math.max(
      h / 2 / Math.tan(half),
      w / 2 / (Math.tan(half) * aspect),
    ));
    camera.lookAt(0, y, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, fit]);

  return null;
}

export function BottleScene({
  tier,
  palette,
  wine,
  className,
  fit = 'sequence',
}: {
  tier: Tier;
  palette: Palette;
  wine: string;
  className?: string;
  fit?: Fit;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  /* No pixels are drawn while the scene is scrolled away. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <Canvas
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        camera={{ fov: 36, position: [0, 0.05, 7], near: 0.1, far: 80 }}
        gl={{
          antialias: tier !== 'low',
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <FitCamera fit={fit} />
        <Studio tier={tier} />
        {/* Bottle first: it publishes the lip position the stream falls from. */}
        <Bottle tier={tier} palette={palette} />
        <PourStream tier={tier} wine={wine} />
        <WineGlass tier={tier} wine={wine} />
        <AdaptiveDpr />
        <Preload all />
      </Canvas>
    </div>
  );
}
