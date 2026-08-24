import { GRAPE, LIBRE, type Traced } from './paths';
import styles from './Logo.module.css';

/**
 * The LIBRE logo.
 * ============================================================================
 * The wordmark is a custom, hand-drawn piece of artwork — traced from the
 * supplied guidelines, not set in a typeface. See `paths.ts`.
 *
 * The 2026 guidelines were issued under the earlier Olé! LIBRE identity, in
 * which "olé!" was the primary logo and LIBRE the sub-mark. Olé! has since
 * been dropped: LIBRE is now the brand, and the wordmark stands alone.
 *
 * The mark is never skewed, recoloured beyond `currentColor`, filtered or
 * animated internally. Clear space is enforced by the `--clear-space` token.
 */

type Variant = 'primary' | 'mark';

const ART: Record<Variant, Traced> = {
  /** The LIBRE wordmark — the logo, everywhere it fits. */
  primary: LIBRE,
  /** The grape — for favicons, cursors and anywhere the wordmark would be
      too small to read. It is the brand's own icon, not a monogram. */
  mark: GRAPE,
};

export function Logo({
  variant = 'primary',
  className,
  label = 'LIBRE — home',
  decorative = false,
}: {
  variant?: Variant;
  className?: string;
  /** Accessible name. Ignored when `decorative`. */
  label?: string;
  /** True when an adjacent element already names the link. */
  decorative?: boolean;
}) {
  const art = ART[variant];

  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      <svg
        className={styles.mark}
        viewBox={`0 0 ${art.w} ${art.h}`}
        role={decorative ? 'presentation' : 'img'}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : label}
        focusable="false"
      >
        {decorative ? null : <title>{label}</title>}
        <g transform={art.t} fill="currentColor">
          <path d={art.d} />
        </g>
      </svg>
    </span>
  );
}
