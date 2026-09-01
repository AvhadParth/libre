'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { products, formatPrice, type Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { burstFrom } from './brand/Confetti';
import { playCue } from '@/lib/sound';
import { Arrow, Scribble } from './brand/Marks';
import { SampleTag } from './Pending';
import styles from './VibeSelector.module.css';

/**
 * The shop row.
 *
 * Conventional product cards — even grid, equal heights, image over copy over
 * price over button, which is the order people already know how to read. The
 * one thing that is ours: each card's image panel is filled with that bottle's
 * own colour from the palette, so the row reads as a band of LIBRE colour
 * rather than five grey thumbnails, and the bottle rises out of its panel when
 * you go for it.
 *
 * The shelf section above browses the range. This one sells it, which is why
 * the price and the quantity live here and nowhere else on the page.
 *
 * Each card holds two photographs of the same bottle at the same scale — the
 * styled studio shot, and the cut-out. Going for the card dissolves one into
 * the other, so the set dressing falls away and leaves the bottle standing on
 * its own colour. They line up because both plates are the same 1023x1537 frame
 * with the bottle in the same place, which is what lets a plain cross-fade read
 * as one photograph changing rather than two swapping.
 */

function Card({ product }: { product: Product }) {
  const cart = useCart();
  const button = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const add = () => {
    cart.add(product.slug, qty);
    playCue('burst', { volume: 0.42 });
    burstFrom(button.current, { count: 38, power: 0.74 });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    /* The cart drawer opens on its own — the provider's `add` does it — so this
       is only the in-place confirmation on the button itself. */
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <li className={styles.card}>
      {/* The panel is the only themed part of the card; the body stays on the
          section's cream so five colours in a row never get shouty. */}
      <div className={styles.panel} data-theme={product.theme}>
        <img
          className={`${styles.shot} ${styles.scene}`}
          src={`/photography/cards/${product.slug}-studio.webp`}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <img
          className={`${styles.shot} ${styles.cut}`}
          src={`/photography/cards/${product.slug}-cutout.webp`}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className={styles.badge}>0.0%</span>
      </div>

      <div className={styles.body}>
        <h3 className={`display ${styles.name}`}>
          <Link href={`/wine/${product.slug}`} className={styles.link} data-cursor="MEET IT">
            {product.name}
          </Link>
        </h3>
        <p className={styles.variant}>{product.variant}</p>
        <p className={styles.personality}>{product.personality}</p>

        <p className={styles.price}>
          {product.price === null ? 'Coming soon' : formatPrice(product.price, product.currency)}
          {product.estimates.includes('price') && <SampleTag />}
        </p>

        <div className={styles.buy}>
          <div className={styles.qty}>
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label={`One fewer ${product.name}`}
            >
              −
            </button>
            <span aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(12, q + 1))}
              aria-label={`One more ${product.name}`}
            >
              +
            </button>
          </div>

          <button
            ref={button}
            type="button"
            className={styles.add}
            onClick={add}
            data-added={added || undefined}
            data-cursor="LET'S POUR"
          >
            {added ? 'Added' : 'Add to cart'}
            {!added && <Arrow className={styles.addArrow} />}
          </button>
        </div>
      </div>
    </li>
  );
}

export function VibeSelector() {
  return (
    <section id="shop" className={styles.section} aria-labelledby="shop-heading">
      <div className={`shell ${styles.intro}`}>
        <h2 className={`display display--l ${styles.title}`} id="shop-heading">
          Go on,{' '}
          <span className="marked">
            then.
            <Scribble kind="underline" />
          </span>
        </h2>
        <p className={styles.standfirst}>Five bottles, all 0.0%. Pick one up.</p>
      </div>

      <ul className={`shell ${styles.grid}`}>
        {products.map((product) => (
          <Card key={product.slug} product={product} />
        ))}
      </ul>
    </section>
  );
}
