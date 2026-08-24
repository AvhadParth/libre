import { Grape } from './brand/Marks';
import styles from './Marquee.module.css';

/**
 * A band of brand language, moving at a walking pace.
 * CSS-only, so it costs nothing and stops dead under prefers-reduced-motion.
 */
export function Marquee({
  items,
  speed = 42,
  reverse = false,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
}) {
  const run = (
    <span className={styles.run} aria-hidden="true">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={styles.item}>
          {item}
          <Grape className={styles.grape} />
        </span>
      ))}
    </span>
  );

  return (
    <div className={styles.marquee} data-reverse={reverse}>
      <div className={styles.viewport} style={{ ['--speed' as string]: `${speed}s` }}>
        {run}
        {run}
      </div>
      <span className="sr-only">{items.join('. ')}.</span>
    </div>
  );
}
