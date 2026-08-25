import { BRAND } from '@/lib/content-config';
import styles from './Marquee.module.css';

/**
 * A band of brand language with the range walking through it.
 *
 * The separator between phrases used to be a small grape icon on the section's
 * own cream ground, which made the whole band a hairline you scrolled past. It
 * now carries the actual bottles, cycling through the five, on Sol Yellow — so
 * it reads as a deliberate divider between sections rather than wallpaper, and
 * the site's best asset stops going unused.
 *
 * Typography follows the guidelines: Avenir carries the phrases, and Chantal
 * is reserved for the one thing here that is logotype rather than copy — any
 * line containing the brand name. That is decided from the text rather than
 * configured per call, so the wordmark can never end up set in the body face
 * by someone adding an item and forgetting to flag it.
 *
 * Still CSS-only, so it costs nothing and stops dead under prefers-reduced-motion.
 */

/** True when the line carries the brand name, and so wants the display face. */
const isWordmark = (text: string) =>
  text.toUpperCase().includes(BRAND.name.toUpperCase());

/**
 * Band-sized cut-outs: 300px tall WebP rather than the full 1023×1537 PNGs,
 * which are ~700KB each and would have put 3.4MB behind a decorative strip.
 */
const BOTTLES = [
  { src: '/photography/marquee/sparkling-rose.webp', alt: 'LIBRE Sparkling Rosé' },
  { src: '/photography/marquee/gold-pearl.webp', alt: 'LIBRE Gold Pearl' },
  { src: '/photography/marquee/merlot-red.webp', alt: 'LIBRE Merlot' },
  { src: '/photography/marquee/sparkling-white.webp', alt: 'LIBRE Sparkling White' },
  { src: '/photography/marquee/sauvignon-blanc-white.webp', alt: 'LIBRE Sauvignon Blanc' },
];

export function Marquee({
  items,
  speed = 42,
  reverse = false,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
}) {
  const run = (key: string) => (
    <span key={key} className={styles.run} aria-hidden="true">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={styles.item}
          data-wordmark={isWordmark(item) || undefined}
        >
          {item}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.bottle}
            src={BOTTLES[i % BOTTLES.length].src}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
      ))}
    </span>
  );

  return (
    <div className={styles.marquee} data-reverse={reverse}>
      <div className={styles.viewport} style={{ ['--speed' as string]: `${speed}s` }}>
        {run('a')}
        {run('b')}
      </div>
      <span className="sr-only">{items.join('. ')}.</span>
    </div>
  );
}
