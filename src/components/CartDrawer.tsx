'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/products';
import { prefersReducedMotion } from '@/lib/motion';
import { Arrow, Grape } from './brand/Marks';
import { Pending, SampleTag } from './Pending';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const cart = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cart.isOpen) return;

    closeBtn.current?.focus();
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion() && panel.current) {
      gsap.fromTo(
        panel.current.querySelectorAll('[data-line]'),
        { opacity: 0, x: 32 },
        { opacity: 1, x: 0, duration: 0.65, stagger: 0.06, ease: 'expo.out', delay: 0.18 },
      );
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cart.close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [cart.isOpen, cart]);

  return (
    <>
      <div
        className={styles.scrim}
        data-open={cart.isOpen}
        onClick={cart.close}
        aria-hidden="true"
      />
      <aside
        ref={panel}
        className={styles.drawer}
        data-open={cart.isOpen}
        data-theme="cream"
        aria-label="Cart"
        role="dialog"
        aria-modal={cart.isOpen}
        inert={!cart.isOpen}
      >
        <header className={styles.head}>
          <h2 className={`display display--s ${styles.title}`}>
            {cart.count > 0 ? 'Nicely done.' : 'Nothing yet.'}
          </h2>
          <button ref={closeBtn} type="button" className={styles.close} onClick={cart.close}>
            <span className="sr-only">Close cart</span>
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        {cart.lines.length === 0 ? (
          <div className={styles.empty}>
            <Grape className={styles.emptyGrape} />
            <p className="body">No occasion required — but you do need a bottle.</p>
            <Link href="/wine" className="btn" onClick={cart.close}>
              Meet the wine <Arrow className="btn__arrow" />
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.lines}>
              {cart.lines.map(({ product, qty }) => (
                <li key={product.slug} className={styles.line} data-line>
                  <div className={styles.swatch} data-theme={product.theme} aria-hidden="true">
                    <Grape className={styles.swatchGrape} />
                  </div>
                  <div className={styles.lineBody}>
                    <Link href={`/wine/${product.slug}`} className={styles.lineName} onClick={cart.close}>
                      {product.name}
                    </Link>
                    <p className={styles.lineMeta}>
                      {product.volume ?? <Pending inline>Volume TBC</Pending>}
                    </p>
                    <div className={styles.qty}>
                      <button
                        type="button"
                        onClick={() => cart.setQty(product.slug, qty - 1)}
                        aria-label={`Decrease ${product.name} quantity`}
                      >−</button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQty(product.slug, qty + 1)}
                        aria-label={`Increase ${product.name} quantity`}
                      >+</button>
                    </div>
                  </div>
                  <div className={styles.linePrice}>
                    {product.price === null ? (
                      <Pending inline>Price TBC</Pending>
                    ) : (
                      <>
                        {formatPrice(product.price * qty, product.currency)}
                        {product.estimates.includes('price') && <SampleTag />}
                      </>
                    )}
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => cart.remove(product.slug)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className={styles.foot}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <strong>
                  {cart.subtotal === null ? '—' : formatPrice(cart.subtotal)}
                  {cart.subtotalIsEstimate && cart.subtotal !== null && <SampleTag />}
                </strong>
              </div>
              <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
              <Link href="/cart" className="btn btn--lg" onClick={cart.close}>
                Go to cart <Arrow className="btn__arrow" />
              </Link>
              <button type="button" className={`link ${styles.keep}`} onClick={cart.close}>
                Keep pouring
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
