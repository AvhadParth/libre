/**
 * The still life.
 *
 * Served to reduced-motion users, devices without WebGL, and search engines.
 * It carries the same composition and the same colours — it simply doesn't move.
 */
export function BottleFallback({
  glass = 'var(--vine)',
  wine = 'var(--rouge)',
  foil = 'var(--sol)',
  cream = 'var(--cream)',
  className,
}: {
  glass?: string;
  wine?: string;
  foil?: string;
  cream?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 260 420" className={className} role="img"
         aria-label="A LIBRE bottle beside a filled wine glass.">
      <defs>
        <linearGradient id="bf-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={glass} stopOpacity=".95" />
          <stop offset=".34" stopColor={glass} stopOpacity=".55" />
          <stop offset=".62" stopColor={glass} stopOpacity=".95" />
          <stop offset="1" stopColor={glass} stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="bf-wine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={wine} />
          <stop offset=".4" stopColor={wine} stopOpacity=".72" />
          <stop offset="1" stopColor={wine} />
        </linearGradient>
      </defs>

      {/* glass of wine */}
      <g transform="translate(20 168)">
        <path d="M6 4h56c0 38-11 57-28 59C17 61 6 42 6 4Z" fill="url(#bf-wine)" opacity=".9" />
        <path d="M6 4h56c0 38-11 57-28 59C17 61 6 42 6 4ZM34 63v56M16 130c0-6 9-11 18-11s18 5 18 11Z"
              fill="none" stroke={glass} strokeWidth="2.4" strokeLinejoin="round" opacity=".85" />
      </g>

      {/* bottle */}
      <g transform="translate(122 22)">
        <path d="M28 372c-11 0-17-5-17-14V150c0-16 4-25 12-34l9-11V72h24v33l9 11c8 9 12 18 12 34v208c0 9-6 14-17 14Z"
              fill="url(#bf-glass)" />
        <rect x="28" y="46" width="24" height="30" rx="2" fill={foil} />
        <rect x="11" y="196" width="58" height="98" fill={cream} />
        <text x="40" y="240" textAnchor="middle" fill={wine}
              style={{ font: '500 19px var(--font-display)', letterSpacing: '.04em' }}>
          LIBRE
        </text>
        <line x1="20" y1="252" x2="60" y2="252" stroke={wine} strokeWidth="1" opacity=".45" />
        <text x="40" y="266" textAnchor="middle" fill={wine} opacity=".6"
              style={{ font: '300 6px var(--font-text)', letterSpacing: '.18em' }}>
          WITHOUT THE RULES
        </text>
      </g>
    </svg>
  );
}
