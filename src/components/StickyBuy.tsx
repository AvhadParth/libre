'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice, type Product } from '@/lib/products';
import { burstFrom } from './brand/Confetti';
import { playCue } from '@/lib/sound';
import { Arrow } from './brand/Marks';
import styles from './StickyBuy.module.css';

/**
 * The buy panel, kept within reach.
 *
 * Everything below the hero — the ingredients, the nutrition panel, the rest of
 * the range — is read AFTER the only Add to cart on the page has scrolled away,
 * so the moment someone is convinced they have to scroll back up to act. This
 * bar carries the price and the button for the rest of the page.
 *
 * It is shown by an IntersectionObserver on the hero's own button rather than a
 * scroll offset, so it appears exactly when the real one leaves and never
 * double-renders a call to action.
 */
export function StickyBuy({ product, watch }: { product: Product; watch: string }) {
  const cart = useCart();
  const [visible, setVisible] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const target = document.querySelector(watch);
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '0px' },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [watch]);

  const add = () => {
    cart.add(product.slug, qty);
    playCue('burst', { volume: 0.4 });
    burstFrom(button.current, { count: 34, power: 0.7 });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={styles.bar} data-shown={visible || undefined} aria-hidden={!visible}>
      <div className={styles.inner}>
        <img
          className={styles.thumb}
          src={`/photography/shelf/${product.slug}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
        />

        <div className={styles.what}>
          <p className={styles.name}>{product.name}</p>
          <p className={styles.meta}>
            {product.volume}
            {product.volume && product.variant ? ' · ' : ''}
            {product.variant}
          </p>
        </div>

        <p className={styles.price}>
          {product.price === null ? '—' : formatPrice(product.price, product.currency)}
        </p>

        <div className={styles.qty}>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label={`One fewer ${product.name}`}
            tabIndex={visible ? 0 : -1}
          >
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(12, q + 1))}
            aria-label={`One more ${product.name}`}
            tabIndex={visible ? 0 : -1}
          >
            +
          </button>
        </div>

        <button
          ref={button}
          type="button"
          className={styles.add}
          onClick={add}
          disabled={!product.inStock}
          tabIndex={visible ? 0 : -1}
          data-cursor="LET'S POUR"
        >
          {!product.inStock ? 'Out of stock' : added ? 'Added' : 'Add to cart'}
          {product.inStock && !added && <Arrow className={styles.addArrow} />}
        </button>
      </div>
    </div>
  );
}
