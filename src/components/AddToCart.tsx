'use client';

import { useRef, useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/products';
import { burstFrom } from './brand/Confetti';
import { playCue } from '@/lib/sound';
import { Arrow } from './brand/Marks';
import styles from './AddToCart.module.css';

export function AddToCart({ product, size = 'lg' }: { product: Product; size?: 'lg' | 'sm' }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const button = useRef<HTMLButtonElement>(null);

  const add = () => {
    cart.add(product.slug, qty);
    playCue('burst', { volume: 0.45 });
    burstFrom(button.current, { count: 46, power: 0.8 });
  };

  return (
    <div className={styles.row}>
      <div className={styles.qty}>
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity">−</button>
        <span aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</span>
        <button type="button" onClick={() => setQty((q) => Math.min(12, q + 1))}
                aria-label="Increase quantity">+</button>
      </div>

      <button
        ref={button}
        type="button"
        className={`btn ${size === 'lg' ? 'btn--lg' : ''} ${styles.add}`}
        onClick={add}
        disabled={!product.inStock}
        data-cursor={product.inStock ? "LET'S POUR" : 'SOLD OUT'}
      >
        {product.inStock ? 'Add to cart' : 'Out of stock'}
        <Arrow className="btn__arrow" />
      </button>
    </div>
  );
}
