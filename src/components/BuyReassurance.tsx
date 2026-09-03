import { ORIGIN, type Product } from '@/lib/products';
import styles from './BuyReassurance.module.css';

/**
 * The four things people want to know before they commit, answered next to the
 * button rather than a thousand pixels below it in a nutrition table.
 *
 * Every line is read from the catalogue — the alcohol declaration and the serve
 * notes come off the supplied labels. There is deliberately nothing here about
 * delivery, returns or dispatch: shipping, taxes and payment are all still
 * unconfigured, and inventing a promise at the point of purchase is the one
 * place it would do real damage.
 */
const find = (p: Product, label: string) =>
  p.details?.find((d) => d.label.toLowerCase() === label.toLowerCase())?.value ?? null;

export function BuyReassurance({ product }: { product: Product }) {
  const alcohol = find(product, 'Alcohol');
  const serve = find(product, 'Serve');
  const keeps = find(product, 'After opening');

  const points = [
    alcohol && { k: 'Alcohol', v: alcohol },
    product.volume && { k: 'Format', v: `${product.volume} · glass bottle` },
    serve && { k: 'Serve', v: serve },
    keeps && { k: 'Once open', v: keeps },
  ].filter(Boolean) as { k: string; v: string }[];

  if (!points.length) return null;

  return (
    <dl className={styles.list}>
      {points.map((p) => (
        <div key={p.k} className={styles.item}>
          <dt className={styles.key}>{p.k}</dt>
          <dd className={styles.value}>{p.v}</dd>
        </div>
      ))}
      <div className={styles.item}>
        <dt className={styles.key}>Made by</dt>
        <dd className={styles.value}>
          {ORIGIN.house}, {ORIGIN.country} — since {ORIGIN.since}
        </dd>
      </div>
    </dl>
  );
}
