'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Tier } from '@/lib/motion';
import { lip, seq } from './store';
import { GLASS_BRIM, GLASS_FLOOR } from './profiles';
import { MARKS, glassFill, mix, streamHead, streamTail } from './sequence';

/**
 * The stream.
 *
 * A tapered cylinder that thins as it falls (because falling liquid speeds up
 * and conserves volume), wobbles on two out-of-phase frequencies so it never
 * loops visibly, and is revealed head-first then broken tail-first when the
 * bottle comes back upright.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uLen;
  varying float vT;
  varying vec3 vNormalView;

  void main() {
    vT = -position.y;                 // 0 at the lip, 1 at the surface
    vec3 p = position;

    float wobble =
      sin(vT * 21.0 + uTime * 10.5) * 0.011 +
      sin(vT * 8.5  - uTime * 6.2)  * 0.007;

    float taper = mix(1.0, 0.58, vT); // volume conserved as it accelerates
    p.x = p.x * taper + wobble * (0.3 + vT);
    p.z = p.z * taper + cos(vT * 17.0 + uTime * 8.4) * 0.009 * (0.3 + vT);
    p.y *= uLen;

    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uHead;
  uniform float uTail;
  uniform float uOpacity;
  varying float vT;
  varying vec3 vNormalView;

  void main() {
    float reveal =
      (1.0 - smoothstep(uHead, uHead + 0.06, vT)) *
      smoothstep(uTail - 0.06, uTail, vT);
    if (reveal < 0.02) discard;

    // Edges go dark and dense, the centre stays bright — a refracting cylinder.
    float fres = pow(1.0 - abs(dot(vNormalView, vec3(0.0, 0.0, 1.0))), 2.0);
    vec3 col = mix(uColor * 1.9, uColor * 0.5, fres);

    gl_FragColor = vec4(col, reveal * uOpacity * (0.68 + 0.32 * fres));

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function PourStream({ tier, wine }: { tier: Tier; wine: string }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(
      0.058, 0.058, 1,
      tier === 'low' ? 8 : 12,
      tier === 'low' ? 18 : 36,
      true,
    );
    g.translate(0, -0.5, 0); // hangs from the origin
    return g;
  }, [tier]);

  /* Built imperatively so this component owns the uniforms object outright and
     mutates it every frame — no reconciliation between React and the GPU. */
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uLen: { value: 1 },
        uColor: { value: new THREE.Color(wine) },
        uHead: { value: 0 },
        uTail: { value: 0 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: true,
    });
    return mat;
  }, [wine]);

  const uniforms = material.uniforms;

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;

    const p = seq.progress;
    const head = streamHead(p);
    const tail = streamTail(p);
    const alive = head > 0.001 && tail < 0.999;

    g.visible = alive;
    if (!alive) return;

    // Fall from the lip to whatever the surface height currently is.
    const surfaceY = MARKS.glass.y + mix(GLASS_FLOOR, GLASS_BRIM, glassFill(p));
    g.position.set(lip.x, lip.y, lip.z);
    uniforms.uLen.value = Math.max(0.05, lip.y - surfaceY);

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uHead.value = head;
    uniforms.uTail.value = tail;
    uniforms.uOpacity.value = 1;
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={mesh} geometry={geometry} material={material} renderOrder={5} frustumCulled={false} />
    </group>
  );
}
