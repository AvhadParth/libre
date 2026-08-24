'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Tier } from '@/lib/motion';
import type { BottlePalette } from '@/lib/palette';
import { seq, lip } from './store';
import {
  MARKS, damp, easeInOut, easeOut, easeOutBack, mix, stage,
} from './sequence';
import {
  BOTTLE_LIQUID_PROFILE, BOTTLE_LIQUID_TOP, BOTTLE_PROFILE, lathe,
} from './profiles';
import { makeLabelTexture } from './labelTexture';

/* One definition of a colourway, in lib/palette.ts, where the real packaging
   spec lives. Aliased so the 3D layer's importers do not reach past it. */
export type Palette = BottlePalette;

const TOP_LOCAL = new THREE.Vector3(0, BOTTLE_LIQUID_TOP + MARKS.bottleGrip, 0);
const BOTTOM_LOCAL = new THREE.Vector3(0, 0.16 + MARKS.bottleGrip, 0);
const LIP_LOCAL = new THREE.Vector3(0, 3.255 + MARKS.bottleGrip, 0);

/**
 * The bottle.
 *
 * One lathed silhouette, one lathed volume of wine, a wrapped label and a cork.
 * The wine is clipped by a plane in WORLD space, which means the surface stays
 * level while the bottle tips — the single detail that makes the pour read as
 * liquid rather than as an animation.
 */
export function Bottle({ tier, palette }: { tier: Tier; palette: Palette }) {
  const group = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const cork = useRef<THREE.Group>(null);
  const shock = useRef<THREE.Mesh>(null);
  const spin = useRef(0);
  /* Entrance is a one-time arrival on mount, not something the visitor has to
     scroll for — the bottle is already there when the page opens. */
  const intro = useRef(0);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  const segments = tier === 'high' ? 72 : tier === 'medium' ? 48 : 32;

  const geo = useMemo(
    () => ({
      body: lathe(BOTTLE_PROFILE, segments),
      wine: lathe(BOTTLE_LIQUID_PROFILE, Math.max(24, segments - 16)),
      label: new THREE.CylinderGeometry(0.4565, 0.4565, 1.02, segments, 1, true),
      foil: new THREE.CylinderGeometry(0.196, 0.182, 0.46, segments, 1, true),
      cork: new THREE.CylinderGeometry(0.156, 0.152, 0.32, 20),
      shock: new THREE.RingGeometry(0.2, 0.26, 40),
    }),
    [segments],
  );

  const labelMap = useMemo(
    () =>
      makeLabelTexture(
        palette.labelGround,
        palette.labelInk,
        palette.labelAccent,
        palette.labelArt,
      ),
    [palette],
  );

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 20), []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      labelMap.dispose();
    },
    [geo, labelMap],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const g = group.current;
    const s = spinner.current;
    if (!g || !s) return;

    intro.current = damp(intro.current, 1, 2.4, dt);
    const arrival = easeOut(intro.current);

    const p = seq.progress;
    const present = easeInOut(stage(p, 'present'));
    const pop = stage(p, 'pop');
    const pour = easeInOut(stage(p, 'pour'));
    const settle = easeInOut(stage(p, 'settle'));
    const t = state.clock.elapsedTime;

    /* ---- travel between the three staging marks ---- */
    const x = mix(mix(MARKS.bottleIdle.x, MARKS.bottlePour.x, pour), MARKS.bottleRest.x, settle);
    const y = mix(mix(MARKS.bottleIdle.y, MARKS.bottlePour.y, pour), MARKS.bottleRest.y, settle);
    const rot = mix(mix(0, MARKS.bottlePour.rot, pour), MARKS.bottleRest.rot, settle);

    const calm = 1 - pour;
    const float = Math.sin(t * 0.85) * 0.04 * calm;

    /* A hard jolt on the cork's release, decaying fast. */
    const jolt = pop > 0.32 && pop < 0.62 ? Math.sin((pop - 0.32) * 90) * (0.62 - pop) * 0.28 : 0;

    /* Portrait screens meet the bottle up close, then pull back to make room
       for the glass — a composition change, not a shrunken desktop layout. */
    const heroScale = seq.portrait ? 1.22 : 1.1;
    g.scale.setScalar(mix(mix(heroScale, 1, pour), 1, settle) * mix(0.82, 1, arrival));

    g.position.x = damp(g.position.x, x + seq.pointerX * 0.14 * calm, 6, dt);
    g.position.y = damp(g.position.y, y + float - (1 - arrival) * 2.4, 6, dt);
    g.rotation.z = damp(g.rotation.z, rot, 5.5, dt) + jolt;
    g.rotation.x = damp(g.rotation.x, -seq.pointerY * 0.2 * calm, 4, dt);

    /* Turn to present the label, then keep an unhurried drift going. */
    spin.current += dt * 0.12 * calm;
    s.rotation.y = damp(
      s.rotation.y,
      Math.PI * 0.06 + present * Math.PI * 0.85 + spin.current + seq.pointerX * 0.26 * calm,
      3.2,
      dt,
    );

    /* ---- the wine keeps its own level, whatever the bottle does ---- */
    g.updateMatrixWorld();
    const top = TOP_LOCAL.clone().applyMatrix4(g.matrixWorld).y;
    const bottom = BOTTOM_LOCAL.clone().applyMatrix4(g.matrixWorld).y;
    const high = Math.max(top, bottom);
    const low = Math.min(top, bottom);
    clip.constant = mix(high + 0.03, low + (high - low) * 0.42, pour * 0.92);

    /* Publish the lip so the stream knows where to fall from. */
    const lipWorld = LIP_LOCAL.clone().applyMatrix4(g.matrixWorld);
    lip.x = lipWorld.x;
    lip.y = lipWorld.y;
    lip.z = lipWorld.z;

    /* ---- POP: pressure, then release ---- */
    const c = cork.current;
    if (c) {
      const press = Math.min(pop / 0.34, 1);
      const fly = pop > 0.34 ? easeOutBack((pop - 0.34) / 0.66) : 0;
      // 3.2 is the cork's seat in the neck; press and fly are displacement FROM it.
      c.position.y = 3.06 + press * 0.06 + fly * 2.0;
      c.position.x = fly * 0.42;
      c.position.z = fly * 0.22;
      c.rotation.z = fly * 5.4;
      c.rotation.x = fly * 3.1;
      const gone = Math.max(0, (pop - 0.72) / 0.28);
      c.scale.setScalar(Math.max(0.0001, 1 - gone));
      c.visible = gone < 1;
    }

    /* A single ring of released pressure. Restraint — not a firework. */
    const sh = shock.current;
    if (sh) {
      const burst = pop > 0.34 ? (pop - 0.34) / 0.4 : 0;
      const alive = burst > 0 && burst < 1;
      sh.visible = alive;
      if (alive) {
        sh.scale.setScalar(1 + burst * 7);
        (sh.material as THREE.MeshBasicMaterial).opacity = (1 - burst) * 0.5;
      }
    }
  });

  const glassMaterial =
    tier === 'high' ? (
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.94}
        thickness={1.15}
        roughness={0.055}
        ior={1.52}
        clearcoat={1}
        clearcoatRoughness={0.06}
        attenuationDistance={0.9}
        attenuationColor={palette.glass}
        envMapIntensity={1.25}
        transparent
      />
    ) : (
      <meshPhysicalMaterial
        color={palette.glass}
        roughness={0.12}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.08}
        envMapIntensity={1.9}
        transparent
        opacity={0.68}
      />
    );

  return (
    <group ref={group} position={[0, 0.35, 0]}>
      <group ref={spinner} position={[0, MARKS.bottleGrip, 0]}>
        {/* wine — clipped level, always */}
        <mesh geometry={geo.wine} renderOrder={1}>
          {/* Opaque on purpose: a transparent double-sided lathe sorts its own
              front and back faces against each other and stripes. */}
          <meshPhysicalMaterial
            color={palette.wine}
            roughness={0.16}
            metalness={0}
            clearcoat={0.7}
            envMapIntensity={0.9}
            clippingPlanes={[clip]}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* glass */}
        <mesh geometry={geo.body} renderOrder={2}>
          {glassMaterial}
        </mesh>

        {/* Label — supplied artwork, see labelTexture.ts.
            The wrap puts its two marks at u=0.25 and u=0.75; rotating the
            cylinder a quarter turn brings the front one square to the camera
            instead of showing the seam between them. */}
        <mesh geometry={geo.label} position={[0, 0.88, 0]} rotation-y={-Math.PI / 2} renderOrder={3}>
          <meshStandardMaterial
            map={labelMap}
            roughness={0.72}
            metalness={0}
            envMapIntensity={0.5}
            side={THREE.DoubleSide}
            /* The wrap is a cut-out: only the two labels are opaque, the rest
               of the band lets the glass through. */
            transparent
            alphaTest={0.06}
          />
        </mesh>

        {/* foil capsule */}
        <mesh geometry={geo.foil} position={[0, 3.0, 0]} renderOrder={3}>
          <meshStandardMaterial
            color={palette.foil}
            roughness={0.3}
            metalness={0.65}
            envMapIntensity={1.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Seated under the capsule at rest — it only appears when it leaves. */}
        <group ref={cork} position={[0, 3.06, 0]}>
          <mesh geometry={geo.cork}>
            <meshStandardMaterial color="#C4A177" roughness={0.85} metalness={0} />
          </mesh>
        </group>

        <mesh ref={shock} geometry={geo.shock} position={[0, 3.3, 0]} rotation-x={-Math.PI / 2} visible={false}>
          <meshBasicMaterial color={palette.labelAccent} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
