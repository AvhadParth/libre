'use client';

import { formatPrice, type Product } from '@/lib/products';
import { AddToCart } from './AddToCart';
import { ProductBottle } from './ProductBottle';
import { Pending, SampleTag } from './Pending';
import { Arrow, Dots, Scribble } from './brand/Marks';
import { scrollTo } from './SmoothScroll';
import styles from './ProductHero.module.css';

/**
 * The product page opens like a cover, not like a listing — but the price, the
 * format, the stock state and the add-to-cart are all above the fold and in
 * plain language. Wow first, then understand, then want, then buy.
 */
export function ProductHero({ product }: { product: Product }) {
  return (
    <section className={styles.hero} data-theme={product.theme} aria-labelledby="product-title">
      <Dots className={styles.dots} size={30} radius={2.4} />

      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className="eyebrow">{product.personality}</p>

          <h1 id="product-title" className={`display display--xl ${styles.name}`}>
            Meet{' '}
            <span className="marked">
              {product.name}.
              <Scribble kind="underline" />
            </span>
          </h1>

          {product.variant ? (
            <p className={styles.variant}>{product.variant}</p>
          ) : (
            <Pending>Variant name awaiting client supply</Pending>
          )}

          <p className="body body--wide">{product.blurb}</p>

          <dl className={styles.facts}>
            <div>
              <dt>Price</dt>
              <dd>
                {product.price === null ? (
                  <Pending inline>TBC</Pending>
                ) : (
                  <>
                    {formatPrice(product.price, product.currency)}
                    {product.estimates.includes('price') && <SampleTag />}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{product.volume ?? <Pending inline>TBC</Pending>}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{product.inStock ? 'In stock' : 'Out of stock'}</dd>
            </div>
          </dl>

          <AddToCart product={product} />

          <button
            type="button"
            className={`link ${styles.secondary}`}
            onClick={() => {
              const target = document.getElementById('flavour');
              if (target) scrollTo(target, -80);
            }}
            data-cursor="GO ON"
          >
            Discover the vibe <Arrow className={styles.secondaryArrow} />
          </button>
        </div>

        <div className={styles.stage}>
          <ProductBottle slug={product.slug} className={styles.bottle} />
        </div>
      </div>
    </section>
  );
}
