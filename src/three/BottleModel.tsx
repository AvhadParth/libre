'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

/**
 * One supplied bottle, normalised into the scene.
 *
 * The models in /public/models are photogrammetry-style scans of the real
 * packaging: a single fused mesh per bottle with the label, capsule and glass
 * all baked into one material. Nothing can be separated out of them — there is
 * no cork to pop and no liquid to pour — so the scene works them as objects:
 * lit, turned and arranged.
 *
 * They arrive at arbitrary scale and origin, so each is measured on load and
 * re-based to stand on y=0 at a known height.
 */
export const BOTTLES = {
  merlot: '/models/bottle-merlot.glb',
  sauvignon: '/models/bottle-sauvignon.glb',
  rose: '/models/bottle-sparkling-rose.glb',
  sparkling: '/models/bottle-sparkling-white.glb',
} as const;

export type BottleId = keyof typeof BOTTLES;

/**
 * The Y rotation, in degrees, that turns each bottle's label to camera.
 *
 * The models are photogrammetry scans and arrived at arbitrary orientation, so
 * these are measured, not assumed. Each bottle was rendered through a full turn
 * against a magenta ground; inside the silhouette the label is the bright,
 * desaturated region, so scoring how much of it is visible and how far its
 * centroid sits from the bottle's centre line finds the front.
 *
 * That worked outright for the two still wines. It misfired on the sparkling
 * pair — their oval badges sit on reflective patterned glass and the metric
 * latched onto highlights instead — so those two were swept by eye and
 * confirmed at full size.
 *
 * A few degrees either way is invisible; adjust freely.
 */
export const LABEL_ANGLE: Record<BottleId, number> = {
  merlot: THREE.MathUtils.degToRad(177),
  sauvignon: THREE.MathUtils.degToRad(6),
  rose: THREE.MathUtils.degToRad(0),
  sparkling: THREE.MathUtils.degToRad(0),
};
/** Every bottle is drawn to this height, so the line-up reads as one family. */
const STAND_HEIGHT = 3.5;

/* `id` is our own prop; Object3D already has a numeric `id`, so it is omitted
   from the group props rather than colliding with it. */
type BottleModelProps = Omit<React.ComponentProps<'group'>, 'id'> & { id: BottleId };

export function BottleModel({ id, ...props }: BottleModelProps) {
  const { scene } = useGLTF(BOTTLES[id]);

  /* Clone so the same GLB can appear more than once, and so our transforms
     never mutate the cached original. */
  const object = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = STAND_HEIGHT / size.y;
    clone.scale.setScalar(scale);

    const scaled = new THREE.Box3().setFromObject(clone);
    const centre = scaled.getCenter(new THREE.Vector3());
    // Centre on x/z, and sit the base on the ground plane.
    clone.position.set(-centre.x, -scaled.min.y, -centre.z);

    clone.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const shared = mesh.material as THREE.MeshStandardMaterial;
      if (!shared) return;
      /* Object3D.clone() shares materials between clones, so fading one bottle
         would fade all three. Each instance gets its own. */
      const mat = shared.clone();
      // The scans ship metalness=1 / roughness=1 factors with an ORM map.
      // Glass wants far less metal than that, or it goes black off-axis.
      mat.metalness = Math.min(mat.metalness ?? 1, 0.25);
      mat.envMapIntensity = 0.9;
      // Opacity is driven per frame by the row; depth still writes so the
      // bottle does not see through itself while it is solid.
      mat.transparent = true;
      mat.depthWrite = true;
      mesh.material = mat;
    });
    return clone;
  }, [scene]);

  return (
    <group {...props}>
      <primitive object={object} />
    </group>
  );
}

/** Warm the cache for a bottle before it is mounted. */
export const preloadBottle = (id: BottleId) => useGLTF.preload(BOTTLES[id]);
