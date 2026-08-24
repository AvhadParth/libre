/**
 * Scroll → 3D bridge.
 *
 * A plain mutable object rather than React state: the scroll sequence updates
 * this ~60×/second and useFrame reads it, so the 3D stays perfectly locked to
 * the page without triggering a single React re-render.
 */
export const seq = {
  /** 0 → 1 across the whole POP → POUR sequence. */
  progress: 0,
  /** Normalised pointer, -1 → 1. Drives the bottle's idle tilt. */
  pointerX: 0,
  pointerY: 0,
  /** Set once the scene has finished its entrance. */
  ready: false,
  /** Slug of the product whose colourway the bottle is wearing. */
  variant: 0,
  /** True on tall, narrow viewports — the scene restages rather than shrinks. */
  portrait: false,
};

export const setPointer = (x: number, y: number) => {
  seq.pointerX = x;
  seq.pointerY = y;
};

/** World position of the bottle lip, written by <Bottle> for <PourStream>. */
export const lip = { x: 0, y: 0, z: 0 };
