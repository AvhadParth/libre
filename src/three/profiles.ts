import * as THREE from 'three';

/**
 * Lathe profiles. Every silhouette on this site is a revolved 2D curve, which
 * keeps the geometry tiny (a few thousand triangles) while reading as real
 * blown glass.
 *
 * Units: 1 ≈ 10cm. A 750ml bordeaux bottle stands ~3.2 units tall.
 */

const v = (x: number, y: number) => new THREE.Vector2(x, y);

/** Bottle exterior — punt, body, shoulder, neck, flared lip. */
export const BOTTLE_PROFILE = [
  v(0, 0.14), v(0.16, 0.05), v(0.34, 0.006), v(0.42, 0),
  v(0.448, 0.035), v(0.452, 0.12),
  v(0.452, 1.44), v(0.447, 1.62), v(0.40, 1.83),
  v(0.30, 2.03), v(0.215, 2.21), v(0.178, 2.40),
  v(0.170, 2.64), v(0.168, 3.00),
  v(0.180, 3.08), v(0.192, 3.15), v(0.188, 3.23),
  v(0.148, 3.25), v(0, 3.255),
];

/** Wine inside the bottle. Sits just inside the glass wall. */
export const BOTTLE_LIQUID_PROFILE = [
  v(0, 0.16), v(0.16, 0.09), v(0.33, 0.05), v(0.40, 0.06),
  v(0.412, 0.13), v(0.412, 1.44), v(0.407, 1.62), v(0.365, 1.82),
  v(0.27, 2.02), v(0.19, 2.20), v(0.15, 2.40), v(0.142, 2.70),
  v(0.142, 3.02), v(0, 3.02),
];

export const BOTTLE_LIQUID_TOP = 3.02;
export const BOTTLE_LIP_Y = 3.255;

/**
 * Wine glass — ONE continuous surface: under the foot, out to its edge, back
 * up over the foot, up the stem, and up the bowl to the rim.
 *
 * Deliberately single-walled. A shell modelled as outside-up-and-inside-down
 * puts two transparent walls between the camera and the wine, and they blend
 * against each other in vertex order — which pinstripes the entire bowl. One
 * wall, one blend, clean glass. The rim torus below restores the bright edge
 * that the missing thickness would otherwise have given.
 */
export const GLASS_PROFILE = [
  v(0, 0.030), v(0.34, 0.016), v(0.60, 0.014),
  v(0.44, 0.052), v(0.20, 0.076), v(0.090, 0.10),
  v(0.050, 0.13), v(0.048, 0.92),
  v(0.10, 1.00), v(0.26, 1.145), v(0.41, 1.42),
  v(0.485, 1.80), v(0.505, 2.15), v(0.505, 2.34),
];

/** Radius and thickness of the rim bead. */
export const GLASS_RIM = { radius: 0.503, tube: 0.011, y: 2.34 };

/** Inner wall of the bowl — the liquid volume and the surface radius. */
export const GLASS_INNER = [
  v(0, 1.015), v(0.09, 1.02), v(0.245, 1.16), v(0.395, 1.44),
  v(0.472, 1.80), v(0.492, 2.15), v(0.492, 2.34), v(0, 2.34),
];

export const GLASS_FLOOR = 1.02;
export const GLASS_BRIM = 2.24; // pour to just under the rim, like a person would

/** Inner radius of the bowl at a given height — gives the liquid a real meniscus. */
export function glassRadiusAt(y: number): number {
  const pts = GLASS_INNER.slice(0, 7); // ascending wall only
  if (y <= pts[0].y) return pts[0].x;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return pts[pts.length - 1].x;
}

/** Inner radius of the bottle at a given height. */
export function bottleRadiusAt(y: number): number {
  const pts = BOTTLE_LIQUID_PROFILE;
  let best = pts[0].x;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (y >= Math.min(a.y, b.y) && y <= Math.max(a.y, b.y)) {
      const t = (y - a.y) / (b.y - a.y || 1);
      best = a.x + (b.x - a.x) * t;
    }
  }
  return best;
}

export const lathe = (profile: THREE.Vector2[], segments = 64) =>
  new THREE.LatheGeometry(profile, segments);
