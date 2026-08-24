'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import type { Tier } from '@/lib/motion';
import { Studio } from './Studio';
import { BottleModel, preloadBottle, type BottleId } from './BottleModel';
import { lineup } from './lineup';

export const hasWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/** The line-up, in the order the hero walks through it. */
export const LINEUP: readonly BottleId[] = ['merlot', 'sauvignon', 'sparkling'];

/*
 * One bottle on screen at a time.
 *
 * The bottles are stacked on the same spot rather than laid out in a row: the
 * outgoing one drifts left and fades, the incoming one arrives from the right,
 * and they only ever overlap during the handover itself. DRIFT is deliberately
 * short — far enough to give the change a direction, not so far that two
 * bottles are ever both sitting in the frame.
 */
const DRIFT = 1.15;          // lateral travel across a full step
const RECEDE = 1.1;          // how far a bottle drops back as it leaves
const SHRINK = 0.88;         // and how much smaller it gets
/* Index distance over which a bottle goes from solid to gone. Below 0.5 the
   handover finishes before the next bottle starts arriving. */
const FADE_SPAN = 0.46;
/* The focused bottle sits dead centre. The bottles that slide off to the left
   pass behind the copy, so they are pushed back and blurred rather than moved
   aside — see FOCUS_RANGE below. */
const ROW_OFFSET = 0;

const damp = (a: number, b: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(a, b, lambda, dt);

/* How much world space the shot has to hold. */
const FRAME_H = 5.3;
const FRAME_W = 2.9;
const FRAME_W_NARROW = 3.6;

/**
 * Camera distance that frames the row at a given aspect. Shared by the camera
 * and the depth-of-field pass so the focal plane can never drift off the
 * bottle the camera is actually framing.
 */
function frameDistance(aspect: number, fovDeg: number) {
  const half = THREE.MathUtils.degToRad(fovDeg) / 2;
  const w = aspect < 0.8 ? FRAME_W_NARROW : FRAME_W;
  return Math.max(FRAME_H / 2 / Math.tan(half), w / 2 / (Math.tan(half) * aspect));
}

/**
 * The row itself.
 *
 * The whole group slides so the focused bottle sits on the centre line, and
 * each bottle turns on its own axis at a slightly different rate — enough that
 * the three never look like one rigid object being dragged past the camera.
 */
function Row({ ids }: { ids: readonly BottleId[] }) {
  const group = useRef<THREE.Group>(null);
  const slots = useRef<(THREE.Group | null)[]>([]);
  const fade = useRef<number[]>([]);
  const spin = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    spin.current += d * 0.42;

    const focus = lineup.focus;
    g.position.y = damp(g.position.y, -1.72, 4, d);
    g.rotation.y = damp(g.rotation.y, lineup.pointerX * 0.16, 3.5, d);
    g.rotation.x = damp(g.rotation.x, -lineup.pointerY * 0.06, 3.5, d);

    slots.current.forEach((slot, i) => {
      if (!slot) return;
      const delta = i - focus;                       // <0 passed, >0 upcoming
      const away = Math.abs(delta);

      // Position is a function of distance from focus, not of index, so every
      // bottle takes exactly the same path through the frame.
      slot.position.x = damp(slot.position.x, delta * DRIFT, 6, d);
      slot.position.z = damp(slot.position.z, -away * RECEDE, 6, d);
      slot.scale.setScalar(damp(slot.scale.x, 1 - (1 - SHRINK) * Math.min(1, away), 6, d));
      slot.rotation.y = spin.current * (0.7 + i * 0.15) + delta * 0.22;

      const target = Math.max(0, 1 - away / FADE_SPAN);
      const o = damp(fade.current[i] ?? (i === 0 ? 1 : 0), target, 7, d);
      fade.current[i] = o;
      slot.visible = o > 0.01;
      slot.traverse((n) => {
        const m = (n as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && 'opacity' in m) m.opacity = o;
      });
    });
  });

  return (
    <group ref={group}>
      {ids.map((id, i) => (
        <group
          key={id}
          ref={(el) => { slots.current[i] = el; }}
          position={[i === 0 ? 0 : DRIFT, 0, 0]}
        >
          {/* Each bottle suspends on its own, so the first one to arrive can
              be shown rather than the row waiting on the slowest. */}
          <Suspense fallback={null}>
            <BottleModel id={id} />
          </Suspense>
        </group>
      ))}
    </group>
  );
}

/** Frames the row against the viewport rather than against breakpoints. */
function FitCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    // Hold one bottle plus real air above and below, so the focused bottle
    // never crops against the nav or the bottom edge.
    camera.position.set(0, 0.15, frameDistance(size.width / size.height, camera.fov));
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export function LineupScene({ tier, className }: { tier: Tier; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);

  /* No pixels are drawn while the hero is scrolled away. */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Lazy-load: the first bottle comes down with the page, the other two are
     fetched once the hero is interactive so they never block first paint. */
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const run = () => LINEUP.slice(1).forEach(preloadBottle);
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else window.setTimeout(run, 600);
  }, []);

  const ids = useMemo(() => LINEUP, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      <Canvas
        frameloop={onScreen ? 'always' : 'never'}
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        camera={{ fov: 34, position: [0, 0.15, 8], near: 4, far: 20 }}
        gl={{
          antialias: tier !== 'low',
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <FitCamera />
        <Studio tier={tier} />
        <Row ids={ids} />
        <AdaptiveDpr />
      </Canvas>
    </div>
  );
}
