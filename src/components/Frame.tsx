import type { ThemeName } from '@/lib/products';
import { Dots, Glass, Grape, Scribble } from './brand/Marks';
import styles from './Frame.module.css';

/**
 * Every image slot on the site.
 *
 * No supplied photography exists yet, and generic stock would be worse than
 * nothing, so each slot renders an art-directed composition built from the
 * brand's own graphic language — colour block, grape, glass, scribble, dots —
 * with the shot direction printed on it. The site looks finished, and the
 * placeholders double as a shot list for the photographer.
 *
 * >>> When the photography lands: pass `src` and `alt` and the composition is
 * replaced by the real image. Nothing else changes.
 */

/* The frame's ground is a brand theme like any other section's. */
type Tone = ThemeName;

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export function Frame({
  brief,
  tone = 'rouge',
  ratio = '4 / 5',
  src,
  alt,
  rotate = 0,
  className,
  motif,
}: {
  /** Shot direction — what this image should eventually be. */
  brief: string;
  tone?: Tone;
  ratio?: string;
  src?: string;
  alt?: string;
  rotate?: number;
  className?: string;
  motif?: 'grape' | 'glass' | 'dots';
}) {
  const seed = hash(brief);
  const pick = motif ?? (['grape', 'glass', 'dots'] as const)[seed % 3];
  const drift = (seed % 22) - 11;

  if (src) {
    return (
      <figure
        className={[styles.frame, className].filter(Boolean).join(' ')}
        style={{ aspectRatio: ratio, rotate: `${rotate}deg` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? brief} className={styles.photo} loading="lazy" decoding="async" />
      </figure>
    );
  }

  return (
    <figure
      className={[styles.frame, styles.placeholder, className].filter(Boolean).join(' ')}
      data-theme={tone}
      style={{ aspectRatio: ratio, rotate: `${rotate}deg` }}
      role="img"
      aria-label={`Image placeholder: ${brief}`}
    >
      <Dots className={styles.dots} size={22 + (seed % 10)} radius={1.9} />

      <span className={styles.blob} style={{ translate: `${drift}% ${-drift}%` }} aria-hidden="true" />

      {pick === 'grape' && <Grape className={styles.motif} />}
      {pick === 'glass' && <Glass className={styles.motif} level={0.55} liquid="currentColor" />}
      {pick === 'dots' && <Scribble kind="circle" className={styles.motifWide} />}

      <figcaption className={styles.brief}>
        <span className={styles.briefTag}>Shot brief</span>
        {brief}
      </figcaption>
    </figure>
  );
}
