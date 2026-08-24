'use client';

import { Environment, Lightformer } from '@react-three/drei';
import type { Tier } from '@/lib/motion';

/**
 * Studio lighting, built entirely from geometry — no HDRI is downloaded, so the
 * scene lights itself in a few kilobytes and works offline.
 *
 * The rig is a soft key from the left, a long cool rim from behind and a warm
 * kicker low-right: enough specular travel across curved glass that the bottle
 * reads as a physical object turning in real light.
 */
export function Studio({ tier }: { tier: Tier }) {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[3.5, 6, 4]} intensity={1.15} color="#FFF8E8" />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#F9BDC9" />

      <Environment resolution={tier === 'high' ? 256 : 128} frames={1}>
        <color attach="background" args={['#171015']} />

        {/* Key — a tall softbox raking down the left of the bottle */}
        <Lightformer
          form="rect" intensity={7} color="#FFF8E8"
          position={[-5, 2, 2]} scale={[3, 10, 1]} rotation-y={Math.PI / 2}
        />
        {/* Fill — broad and low, keeps the shadow side from going dead */}
        <Lightformer
          form="rect" intensity={2.2} color="#FFF8E8"
          position={[4.5, 0, 2]} scale={[3, 8, 1]} rotation-y={-Math.PI / 2}
        />
        {/* Rim — the long vertical highlight that travels as the bottle turns */}
        <Lightformer
          form="rect" intensity={9} color="#FFFFFF"
          position={[0, 3, -6]} scale={[1.2, 12, 1]}
        />
        {/* Warm kicker — Sol Yellow catching the shoulder. Kept low and to the
            side: aimed up from underneath it pools in the punt and reads as a
            stray gold blob under the bottle. */}
        <Lightformer
          form="circle" intensity={2.2} color="#FFC33C"
          position={[3.4, 0.6, 3]} scale={2.6}
        />
        {/* Ceiling bounce */}
        <Lightformer
          form="rect" intensity={1.6} color="#FFF8E8"
          position={[0, 8, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2}
        />
      </Environment>
    </>
  );
}
