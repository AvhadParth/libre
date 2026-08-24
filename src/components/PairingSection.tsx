import type { Product } from '@/lib/products';
import { Frame } from './Frame';
import { Pending } from './Pending';
import { Reveal } from './Reveal';
import { Scribble } from './brand/Marks';
import styles from './PairingSection.module.css';

const MOMENT_BRIEFS = [
  'Table mid-meal, plates half-cleared, nobody has moved.',
  'Two people cooking badly and enjoying it.',
  'Late, quiet, one lamp on, glass on the arm of the sofa.',
];

/**
 * Pairings, in two clearly separated registers.
 *
 * "On the table" is factual food guidance and stays empty until the client
 * supplies it. "In the room" is brand expression and is labelled as such, so a
 * moment can never be mistaken for a recommendation.
 */
export function PairingSection({ product }: { product: Product }) {
  const hasFood = product.pairings.some((p) => p.note !== null);

  return (
    <section className={styles.section} data-theme={product.theme} aria-labelledby="pairs-title">
      <div className={`shell ${styles.head}`}>
        <Reveal variant="mask">
          <h2 id="pairs-title" className={`display display--l ${styles.title}`}>
            Pairs{' '}
            <span className="marked">
              with
              <Scribble kind="underline" />
            </span>
          </h2>
        </Reveal>
      </div>

      <div className={`shell ${styles.columns}`}>
        <div className={styles.column}>
          <h3 className={styles.columnHead}>
            On the table
            <span className={styles.columnNote}>Food guidance — client supplied</span>
          </h3>

          <ul className={styles.foodList}>
            {product.pairings.map((pairing, i) => (
              <li key={pairing.label} className={styles.food}>
                <span className={styles.foodNo}>0{i + 1}</span>
                <div>
                  <p className={styles.foodLabel}>{pairing.label}</p>
                  {pairing.note ? (
                    <p className="caption">{pairing.note}</p>
                  ) : (
                    <Pending inline>Pairing note TBC</Pending>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {!hasFood && (
            <p className={styles.disclaimer}>
              Food pairings are placeholders. Real recommendations must come from
              the brand.
            </p>
          )}
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnHead}>
            In the room
            <span className={styles.columnNote}>Brand expression — not a recommendation</span>
          </h3>

          <ul className={styles.moments}>
            {product.moments.map((moment, i) => (
              <li key={moment} className={styles.moment} data-i={i}>
                <Frame
                  brief={MOMENT_BRIEFS[i % MOMENT_BRIEFS.length]}
                  tone={i % 2 ? 'sol' : 'mist'}
                  ratio="4 / 3"
                  rotate={i % 2 ? 2 : -2.5}
                />
                <p className={`display display--s ${styles.momentLabel}`}>{moment}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
