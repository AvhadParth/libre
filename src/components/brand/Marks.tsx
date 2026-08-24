import { CONFETTI, GRAPE, LIBRE, SCRIBBLE, WINEGLASS } from './paths';

/**
 * LIBRE brand iconography.
 * ============================================================================
 * The guidelines name five marks: the grape, the wineglass, the scribbles,
 * the confetti and the polka dots. Four of them are supplied artwork and are
 * traced verbatim in `paths.ts` — they are NOT redrawn here. The polka dots
 * are generated, because a dot field is a pattern, not a drawing.
 *
 * These are not decoration — they are the site's motion vocabulary. Every one
 * is built to be animated: the glass fills, the dots scatter, the scribbles
 * draw themselves. All of them inherit `currentColor` so they recolour with
 * the ground they sit on.
 */

type SvgProps = React.SVGProps<SVGSVGElement>;

/* -------------------------------------------------------------------------- */
/* GRAPE — rolls, bounces, follows the cursor, becomes a particle              */
/* -------------------------------------------------------------------------- */
export function Grape({ title, ...props }: SvgProps & { title?: string }) {
  return (
    <svg viewBox={`0 0 ${GRAPE.w} ${GRAPE.h}`} aria-hidden={!title} {...props}>
      {title ? <title>{title}</title> : null}
      <g transform={GRAPE.t} fill="currentColor">
        <path d={GRAPE.d} />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* WINE GLASS — the `level` prop (0–1) drives the liquid                       */
/* -------------------------------------------------------------------------- */
/**
 * The supplied glass is a solid silhouette, so the liquid cannot sit *behind*
 * an outline the way it would in line art. Instead the bowl is overpainted:
 * the whole mark draws in `currentColor`, then the same path is drawn again in
 * the liquid colour and clipped to the bowl region only. The stem and foot keep
 * their ink, the bowl fills. Bowl runs y≈8 → y≈150 in the traced viewBox.
 */
const BOWL_TOP = 14;
const BOWL_BOTTOM = 150;

export function Glass({
  level = 0,
  liquid = 'var(--rouge)',
  title,
  ...props
}: Omit<SvgProps, 'fill'> & { level?: number; liquid?: string; title?: string }) {
  const clamped = Math.max(0, Math.min(1, level));
  const surface = BOWL_BOTTOM - clamped * (BOWL_BOTTOM - BOWL_TOP);
  const uid = `glass-${liquid.replace(/[^a-z0-9]/gi, '')}-${Math.round(clamped * 100)}`;

  return (
    <svg
      viewBox={`0 0 ${WINEGLASS.w} ${WINEGLASS.h}`}
      aria-hidden={!title}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={uid}>
          <rect
            x="0"
            y={surface}
            width={WINEGLASS.w}
            height={Math.max(0, BOWL_BOTTOM - surface)}
          />
        </clipPath>
      </defs>
      <g transform={WINEGLASS.t}>
        <path d={WINEGLASS.d} fill="currentColor" />
      </g>
      {clamped > 0 ? (
        <g clipPath={`url(#${uid})`}>
          <g transform={WINEGLASS.t}>
            <path d={WINEGLASS.d} fill={liquid} />
          </g>
        </g>
      ) : null}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* SCRIBBLES                                                                   */
/* -------------------------------------------------------------------------- */
/**
 * Two different jobs, deliberately kept apart.
 *
 * `Scribble` is a stroke that attaches to type — it underlines, rings or slashes
 * a word, and it draws itself via stroke-dashoffset. It has to be a single open
 * path with a live stroke width for that to work, so it stays hand-authored.
 *
 * `ScribbleMark` is the supplied icon from the guidelines: a closed, filled
 * cluster. Use it as a standalone graphic, never as an underline.
 */
const SCRIBBLE_PATHS = {
  /* A single pass of a marker — not a there-and-back loop, which reads as a
     lens around the word rather than a line under it. */
  underline: 'M4 15C42 7 84 4 122 6c20 1 38 3 54 7',
  circle:
    'M120 10C74 1 22 12 9 30c-13 19 22 34 88 34 62 0 96-14 92-30-3-13-38-24-84-25',
  slash: 'M6 44C34 30 88 12 156 4',
  wave: 'M2 12c14-11 26 11 40 0s26 11 40 0 26 11 40 0 26 11 38 0',
} as const;

export type ScribbleKind = keyof typeof SCRIBBLE_PATHS;

const VIEWBOX: Record<ScribbleKind, string> = {
  underline: '0 0 180 20',
  circle: '0 0 220 68',
  slash: '0 0 162 50',
  wave: '0 0 162 24',
};

export function Scribble({
  kind = 'underline',
  ...props
}: SvgProps & { kind?: ScribbleKind }) {
  return (
    <svg
      viewBox={VIEWBOX[kind]}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-scribble={kind}
      {...props}
    >
      {/* Stroke width is set in CSS in `em`, so the mark keeps its weight
          relative to the type it belongs to — a 4px line under a 180px
          headline looks like a scratch. */}
      <path
        d={SCRIBBLE_PATHS[kind]}
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The supplied scribble cluster, as drawn in the guidelines. */
export function ScribbleMark({ title, ...props }: SvgProps & { title?: string }) {
  return (
    <svg viewBox={`0 0 ${SCRIBBLE.w} ${SCRIBBLE.h}`} aria-hidden={!title} {...props}>
      {title ? <title>{title}</title> : null}
      <g transform={SCRIBBLE.t} fill="currentColor">
        <path d={SCRIBBLE.d} />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* CONFETTI — the supplied curl cluster                                        */
/* -------------------------------------------------------------------------- */
export function ConfettiMark({ title, ...props }: SvgProps & { title?: string }) {
  return (
    <svg viewBox={`0 0 ${CONFETTI.w} ${CONFETTI.h}`} aria-hidden={!title} {...props}>
      {title ? <title>{title}</title> : null}
      <g transform={CONFETTI.t} fill="currentColor">
        <path d={CONFETTI.d} />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* POLKA DOTS — a field that floats, expands and becomes a transition          */
/* -------------------------------------------------------------------------- */
export function Dots({
  size = 26,
  radius = 2.6,
  ...props
}: SvgProps & { size?: number; radius?: number }) {
  const id = `dots-${size}-${radius}`;
  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* BUBBLES — overlapping translucent circles, the guidelines' pattern device   */
/* -------------------------------------------------------------------------- */
/**
 * From the brand-visualization spreads: circles of brand colour, overlapping
 * and multiplying so the intersections make new tones. Deterministic layout —
 * the same `seed` always produces the same composition.
 */
export function Bubbles({
  seed = 1,
  count = 7,
  colours = ['var(--accent)', 'var(--accent-2)', 'var(--fg)'],
  ...props
}: SvgProps & { seed?: number; count?: number; colours?: string[] }) {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const circles = Array.from({ length: count }, (_, i) => ({
    cx: 12 + rand() * 76,
    cy: 12 + rand() * 76,
    r: 9 + rand() * 22,
    fill: colours[i % colours.length],
  }));

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <g style={{ mixBlendMode: 'multiply' }} opacity="0.72">
        {circles.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
        ))}
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* ARROW — the one shared directional glyph across the button language         */
/* -------------------------------------------------------------------------- */
export function Arrow(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 16" fill="none" width="18" aria-hidden="true" {...props}>
      <path
        d="M1 8h21M15 1l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* BOTTLE — the 2D silhouette used in cards, cart lines and the mobile fallback */
/* -------------------------------------------------------------------------- */
export function BottleMark({
  glass = 'currentColor',
  label = 'var(--cream)',
  ink = 'var(--rouge)',
  foil = 'var(--sol)',
  ...props
}: Omit<SvgProps, 'fill'> & { glass?: string; label?: string; ink?: string; foil?: string }) {
  return (
    <svg viewBox="0 0 82 400" fill="none" aria-hidden="true" {...props}>
      <path
        d="M28 398c-11 0-17-5-17-14V152c0-16 4-25 12-34l9-11V4h18v103l9 11c8 9 12 18 12 34v232c0 9-6 14-17 14Z"
        fill={glass}
      />
      <rect x="28" y="2" width="26" height="34" rx="2" fill={foil} />
      <rect x="11" y="196" width="60" height="104" fill={label} />
      {/* The real LIBRE sub-mark, scaled into the label panel. */}
      <g transform="translate(20 228) scale(0.049)">
        <g transform={LIBRE.t} fill={ink}>
          <path d={LIBRE.d} />
        </g>
      </g>
      <line x1="21" y1="268" x2="61" y2="268" stroke={ink} strokeWidth="1" opacity=".4" />
    </svg>
  );
}
