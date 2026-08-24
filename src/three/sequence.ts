/**
 * The POP → POUR choreography, expressed once as a timing map.
 *
 * Every object in the scene reads this and derives its own behaviour, so the
 * bottle, the cork, the stream and the glass all agree on where the story is
 * without any of them needing to know about each other.
 */
export const STAGE = {
  rise:    [0.00, 0.15],  // bottle arrives
  present: [0.15, 0.29],  // it turns, you look at it
  pop:     [0.29, 0.45],  // the cork leaves
  pour:    [0.45, 0.76],  // the tilt, the stream, the fill
  settle:  [0.76, 1.00],  // everything comes to rest
} as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progress within a named stage, 0 → 1. */
export function stage(p: number, name: keyof typeof STAGE): number {
  const [a, b] = STAGE[name];
  return clamp01((p - a) / (b - a));
}

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack = (t: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Damped follow — gives every reactive movement a little weight. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

/* -------------------------------------------------------------------------- */
/* Staging marks. Tuned so the lip lands directly over the glass rim.          */
/* -------------------------------------------------------------------------- */
export const MARKS = {
  /** The mesh is offset inside its group so the bottle pivots at the grip —
      where a hand would hold it — instead of swinging around its base. */
  bottleGrip: -2.0,

  bottleIdle: { x: 0, y: 0.62, rot: 0 },

  /*
   * 1.75 rad ≈ 100°, i.e. past horizontal. Anything under 90° is a bottle
   * leaning, not a bottle pouring — the lip has to end up BELOW the grip.
   * At this angle the lip lands at (-1.0, 1.15), directly over the glass rim.
   */
  bottlePour: { x: 0.235, y: 1.25, rot: 1.75 },
  bottleRest: { x: 0.6, y: 0.5, rot: 0.14 },

  glass: { x: -1.0, y: -1.85 },
  /** World height of the glass rim. */
  glassRimY: -1.85 + 2.34,
} as const;

/* -------------------------------------------------------------------------- */
/* Shared derivations — the glass and the stream must agree exactly.           */
/* -------------------------------------------------------------------------- */

/** How full the glass is, 0 → 1. Fills across the middle of the pour. */
export const glassFill = (p: number) =>
  easeOut(clamp01((stage(p, 'pour') - 0.26) / 0.5));

/** How far the stream has fallen, 0 → 1. Leads the fill. */
export const streamHead = (p: number) =>
  easeOut(clamp01((stage(p, 'pour') - 0.2) / 0.13));

/** How far the stream has broken away at the lip, 0 → 1. */
export const streamTail = (p: number) =>
  easeInOut(clamp01((stage(p, 'pour') - 0.8) / 0.16));

/** The glass arrives just before it is needed. */
export const glassPresence = (p: number) => clamp01((p - 0.36) / 0.11);
