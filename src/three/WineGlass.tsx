'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Tier } from '@/lib/motion';
import { seq } from './store';
import { MARKS, easeOut, glassFill, glassPresence, mix } from './sequence';
import {
  GLASS_BRIM, GLASS_FLOOR, GLASS_INNER, GLASS_PROFILE, GLASS_RIM, glassRadiusAt, lathe,
} from './profiles';

/**
 * The glass fills for real: the body of wine is clipped by a level world plane,
 * and a separate surface disc is resized every frame to the exact inner radius
 * of the bowl at that height. That is what gives it a meniscus instead of a
 * cylinder poking through the side.
 */
const SHELL = {
  color: '#ffffff',
  roughness: 0.02,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  specularIntensity: 1,
  envMapIntensity: 2.4,
  transparent: true,
  opacity: 0.2,
  depthWrite: false,
} as const;

export function WineGlass({ tier, wine }: { tier: Tier; wine: string }) {
  const group = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const segments = tier === 'high' ? 64 : tier === 'medium' ? 44 : 28;

  const geo = useMemo(
    () => ({
      shell: lathe(GLASS_PROFILE, segments),
      rim: new THREE.TorusGeometry(GLASS_RIM.radius, GLASS_RIM.tube, 8, segments),
      wine: lathe(GLASS_INNER, Math.max(24, segments - 12)),
      surface: new THREE.CircleGeometry(1, Math.max(24, segments - 12)),
    }),
    [segments],
  );

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -20), []);

  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  useFrame((state) => {
    const g = group.current;
    const s = surface.current;
    if (!g) return;

    const p = seq.progress;
    const presence = glassPresence(p);
    const fill = glassFill(p);
    const t = state.clock.elapsedTime;

    g.visible = presence > 0.001;
    g.scale.setScalar(mix(0.86, 1, easeOut(presence)));
    g.position.y = MARKS.glass.y + (1 - easeOut(presence)) * -0.55;

    const localLevel = mix(GLASS_FLOOR, GLASS_BRIM, fill);
    clip.constant = g.position.y + localLevel;

    if (s) {
      const filling = fill > 0.001 && fill < 0.999;
      s.visible = fill > 0.001;
      s.position.y = localLevel + 0.002;
      const r = glassRadiusAt(localLevel);
      s.scale.set(r, r, 1);
      // The surface rocks while it is being filled, then settles flat.
      const rock = filling ? 0.055 : Math.max(0, 0.055 - (t % 10) * 0.02);
      s.rotation.x = -Math.PI / 2 + Math.sin(t * 7) * rock * 0.35;
      s.rotation.z = Math.cos(t * 5.5) * rock * 0.5;
    }
  });

  return (
    <group ref={group} position={[MARKS.glass.x, MARKS.glass.y, 0]} visible={false}>
      {/* Wine is rendered opaque. Transmission on a double-sided lathe makes
          its own front and back faces fight for depth order, which shows up as
          vertical stripes across the bowl. */}
      <mesh geometry={geo.wine}>
        <meshPhysicalMaterial
          color={wine}
          roughness={0.12}
          metalness={0}
          clearcoat={0.9}
          clearcoatRoughness={0.06}
          envMapIntensity={1.1}
          clippingPlanes={[clip]}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={surface} geometry={geo.surface} rotation-x={-Math.PI / 2} visible={false}>
        <meshPhysicalMaterial
          color={wine}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/*
        The glass.

        No transmission: three's transmission pass samples the canvas backdrop,
        which is transparent here, so a transmissive glass reads as milky grey
        plastic. A single-walled shell with a hard clearcoat gives the real
        thing — invisible flats, sharp specular travel, and a bright rim.
      */}
      <mesh geometry={geo.shell} renderOrder={2}>
        <meshPhysicalMaterial {...SHELL} side={THREE.DoubleSide} />
      </mesh>

      {/* The rim bead — the bright ring a real glass gets from its thickness. */}
      <mesh
        geometry={geo.rim}
        position={[0, GLASS_RIM.y, 0]}
        rotation-x={-Math.PI / 2}
        renderOrder={3}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          envMapIntensity={3}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
