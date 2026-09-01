'use client';

import { formatPrice, type Product } from '@/lib/products';
import { AddToCart } from './AddToCart';
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
    <section className={styles.hero} data-theme={product.heroGround} aria-labelledby="product-title">
      <Dots className={styles.dots} size={30} radius={2.4} />

      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className="eyebrow">{product.personality}</p>

          {/*
            "Meet" is Avenir and the product name is Chantal — the guidelines
            reserve the display face for headlines and logotype, and a product
            name is the headline here while "Meet" is just the run-up to it.
          */}
          <h1 id="product-title" className={styles.title}>
            <span className={styles.meet}>Meet</span>
            <span className={`display ${styles.name}`}>
              <span className="marked">
                {product.name}.
                <Scribble kind="underline" />
              </span>
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
          {/*
            The photograph, not the 3D render.
            Only four of the five products have a model, so Gold Pearl's page
            had no bottle on it at all — and the render reads flat beside the
            studio plates the rest of the site now uses. The cut-out sits on the
            product's own themed ground, which is what the hero already paints.
          */}
          <img
            className={styles.bottle}
            src={`/photography/cards/${product.slug}-cutout.webp`}
            alt={`A bottle of LIBRE ${product.name}`}
            width={760}
            height={1142}
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
