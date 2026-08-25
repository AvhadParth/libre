import { seeded } from '@/lib/motion';
import styles from './BubbleField.module.css';

/**
 * The overlapping-circle field from the brand-visualization spreads.
 *
 * Circles of brand colour laid over each other and multiplied, so every
 * intersection mixes a new tone out of the palette rather than introducing one.
 * It is the guidelines' own graphic device, and it is the reason the hero does
 * not need a generic wine flourish.
 *
 * Layout is seeded, so the composition is identical on the server and the
 * client and never reshuffles between renders. Each circle carries
 * `data-bubble` and a depth band so the hero's scroll timeline can drift them
 * at different rates.
 *
 * The field is drawn TWICE, once multiplied and once screened, and the two are
 * crossfaded by `--ground-l` — the lightness of whatever colour the ground
 * currently is. Multiply is what makes the overlaps mix on a pale ground, but
 * on a dark one it crushes the circles to nothing, so the dark grounds need
 * screen instead. Picking one per theme meant the blend mode snapped mid-
 * transition and the whole field jumped. Crossfading on lightness means it
 * changes over exactly as gradually as the ground does.
 */

type Bubble = {
  cx: number; cy: number; r: number; fill: string; depth: 0 | 1 | 2;
};

const PALETTE = [
  'var(--rose)', 'var(--mist)', 'var(--coral)',
  'var(--jade)', 'var(--sky)', 'var(--butter)', 'var(--sol)',
];

function compose(count: number, seed: number): Bubble[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const depth = (i % 3) as 0 | 1 | 2;
    /* Big on purpose. The viewBox is sliced to cover, so these read as broad
       overlapping colour fields behind the row — the way the guidelines draw
       them — rather than as a fine texture. */
    const r = 7 + rand() * (depth === 2 ? 16 : depth === 1 ? 11 : 7);
    return {
      cx: 4 + rand() * 92,
      cy: 6 + rand() * 88,
      r,
      fill: PALETTE[Math.floor(rand() * PALETTE.length)],
      depth,
    };
  });
}

export function BubbleField({
  count = 16,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const bubbles = compose(count, seed);

  const circles = (band: string) =>
    bubbles.map((b, i) => (
      <circle
        key={`${band}-${i}`}
        data-bubble
        data-depth={b.depth}
        cx={b.cx}
        cy={b.cy}
        r={b.r}
        fill={b.fill}
      />
    ));

  return (
    <svg
      className={[styles.field, className].filter(Boolean).join(' ')}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Both copies carry `data-bubble` and identical geometry, so the hero's
          drift timeline moves them as one. If only one drifted they would slide
          apart and the crossfade would show two offset fields. */}
      <g className={styles.multiply}>{circles('multiply')}</g>
      <g className={styles.screen}>{circles('screen')}</g>
    </svg>
  );
}
