'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import type { Tier } from '@/lib/motion';
import { Studio } from './Studio';
import { BottleModel, preloadBottle, LABEL_ANGLE, type BottleId } from './BottleModel';
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
export const LINEUP: readonly BottleId[] = ['merlot', 'sauvignon', 'rose', 'sparkling'];

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

/* --- the handover -------------------------------------------------------- */
/*
 * Rotation is a function of scroll POSITION, not scroll speed.
 *
 * Each bottle's angle is its label angle plus its distance from focus times
 * TURN. Three things fall out of that, all of them free:
 *
 *   - a bottle in focus is, by definition, at exactly its label angle, so the
 *     label always ends up facing the reader with no seeking logic at all;
 *   - scrolling one step turns the outgoing bottle through TURN while the
 *     incoming one turns into place by the same amount, so the two cross
 *     mid-turn and merge;
 *   - scrubbing backwards reverses it exactly, because there is no velocity or
 *     momentum anywhere in it.
 */
const TURN = Math.PI;

/*
 * The bottles have to stay visible while they turn, or the rotation happens
 * off-screen and the handover reads as a plain crossfade. Opacity therefore
 * holds near full for the first third of a step and only then gives way, so the
 * turn is seen and the merge happens in the middle where the two overlap.
 */
const FADE_FROM = 0.34;
const FADE_TO = 0.62;

const damp = (a: number, b: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(a, b, lambda, dt);

/** 0 below `from`, 1 above `to`, eased in between. */
const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

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
  const shadows = useRef<(THREE.Mesh | null)[]>([]);
  const fade = useRef<number[]>([]);

  /* A soft ellipse the bottle lands on. Generated rather than loaded so the
     scene still costs nothing to download. */
  const shadowTex = useMemo(() => {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => shadowTex.dispose(), [shadowTex]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);

    const focus = lineup.focus;
    g.position.y = damp(g.position.y, -1.72, 4, d);
    g.rotation.y = damp(g.rotation.y, lineup.pointerX * 0.16, 3.5, d);
    g.rotation.x = damp(g.rotation.x, -lineup.pointerY * 0.06, 3.5, d);

    slots.current.forEach((slot, i) => {
      if (!slot) return;
      const delta = i - focus;                       // <0 passed, >0 upcoming
      const away = Math.abs(delta);

      /*
       * The turn. Position, not speed — so the bottle in focus sits exactly at
       * its label angle, and the one arriving turns into place by the same
       * amount the one leaving turns away. They cross mid-turn and merge.
       */
      slot.rotation.y = (LABEL_ANGLE[ids[i]] ?? 0) + delta * TURN;

      slot.position.x = damp(slot.position.x, delta * DRIFT, 6, d);
      slot.position.z = damp(slot.position.z, -away * RECEDE, 6, d);
      slot.scale.setScalar(damp(slot.scale.x, 1 - (1 - SHRINK) * Math.min(1, away), 6, d));

      /* Held near full while the turn is happening, then given away quickly. */
      const target = 1 - smoothstep(FADE_FROM, FADE_TO, away);
      const o = damp(fade.current[i] ?? (i === 0 ? 1 : 0), target, 8, d);
      fade.current[i] = o;
      slot.visible = o > 0.01;
      slot.traverse((n) => {
        const m = (n as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && 'opacity' in m) m.opacity = o;
      });

      /* The shadow tightens under whichever bottle is standing forward. */
      const sh = shadows.current[i];
      if (sh) {
        const settled = 1 - Math.min(1, away);
        const spread = 1.45 - 0.4 * settled;
        sh.scale.set(spread, spread, 1);
        sh.position.set(slot.position.x, 0.005, slot.position.z);
        const mat = sh.material as THREE.MeshBasicMaterial;
        mat.opacity = o * settled * 0.45;
        sh.visible = mat.opacity > 0.01;
      }
    });
  });

  return (
    <group ref={group}>
      {/* Shadows are siblings of the bottles, not children, so they stay flat
          on the ground plane while the bottle above them tips. */}
      {ids.map((id, i) => (
        <mesh
          key={`shadow-${id}`}
          ref={(el) => { shadows.current[i] = el; }}
          rotation-x={-Math.PI / 2}
          renderOrder={-1}
        >
          <circleGeometry args={[0.85, 40]} />
          <meshBasicMaterial
            map={shadowTex}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </mesh>
      ))}

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
