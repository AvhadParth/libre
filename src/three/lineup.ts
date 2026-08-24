/**
 * Scroll → line-up bridge.
 *
 * A plain mutable object rather than React state: the hero writes to it ~60×/s
 * and useFrame reads it, so the 3D stays locked to the page without triggering
 * a single re-render.
 */
export const lineup = {
  /** 0 → 1 across the whole hero track. */
  progress: 0,
  /** Continuous index of the bottle in focus, 0 → BOTTLE_COUNT-1. */
  focus: 0,
  /** Normalised pointer, -1 → 1. Drives the idle lean. */
  pointerX: 0,
  pointerY: 0,
  /** Flipped once every bottle has loaded, so the copy can fade in with them. */
  ready: false,
};

export const setLineupPointer = (x: number, y: number) => {
  lineup.pointerX = x;
  lineup.pointerY = y;
};
