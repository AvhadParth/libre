'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/products';
import { Themed } from './Themed';
import { Pending, SampleTag } from './Pending';
import { Arrow, BottleMark, Grape } from './brand/Marks';
import styles from './CartView.module.css';

/**
 * The cart.
 *
 * The most experimental site in the world still has to be legible here, so this
 * page drops the tricks: real quantities, real removal, real totals, and an
 * honest account of what is not connected yet.
 */
export function CartView() {
  const cart = useCart();
  const [showCheckoutNote, setShowCheckoutNote] = useState(false);

  if (!cart.hydrated) {
    return (
      <Themed theme="cream" className={styles.page} flush>
        <div className={`shell ${styles.loading}`} aria-live="polite">
          <Grape className={styles.loadingGrape} />
          <p className="caption">Fetching your bottles…</p>
        </div>
      </Themed>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <Themed theme="cream" className={styles.page} flush>
        <div className={`shell ${styles.empty}`}>
          <Grape className={styles.emptyGrape} />
          <h1 className="display display--l">Nothing yet.</h1>
          <p className="lede">No occasion required — but you do need a bottle.</p>
          <Link href="/wine" className="btn btn--lg" data-cursor="LET'S POUR">
            Meet the wine <Arrow className="btn__arrow" />
          </Link>
        </div>
      </Themed>
    );
  }

  return (
    <Themed theme="cream" className={styles.page} flush>
      <div className={`shell ${styles.head}`}>
        <h1 className={`display display--l ${styles.title}`}>Your cart.</h1>
        <p className="caption">
          {cart.count === 1 ? '1 bottle' : `${cart.count} bottles`}
        </p>
      </div>

      <div className={`shell ${styles.layout}`}>
        <ul className={styles.lines}>
          {cart.lines.map(({ product, qty }) => (
            <li key={product.slug} className={styles.line}>
              <div className={styles.art} data-theme={product.theme} aria-hidden="true">
                <BottleMark glass="var(--accent)" foil="var(--bg)" ink="var(--rouge)" label="var(--bg)" />
              </div>

              <div className={styles.info}>
                <Link href={`/wine/${product.slug}`} className={styles.name}>
                  {product.name}
                </Link>
                <p className={styles.personality}>{product.personality}</p>
                <p className={styles.meta}>
                  {product.volume ?? <Pending inline>Volume TBC</Pending>}
                </p>
                <button type="button" className={styles.remove} onClick={() => cart.remove(product.slug)}>
                  Remove
                </button>
              </div>

              <div className={styles.qty}>
                <button type="button" onClick={() => cart.setQty(product.slug, qty - 1)}
                        aria-label={`Decrease ${product.name} quantity`}>−</button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => cart.setQty(product.slug, qty + 1)}
                        aria-label={`Increase ${product.name} quantity`}>+</button>
              </div>

              <p className={styles.price}>
                {product.price === null ? (
                  <Pending inline>Price TBC</Pending>
                ) : (
                  <>
                    {formatPrice(product.price * qty, product.currency)}
                    {product.estimates.includes('price') && <SampleTag />}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryHead}>Summary</h2>

          <dl className={styles.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>
                {cart.subtotal === null ? <Pending inline>TBC</Pending> : formatPrice(cart.subtotal)}
              </dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd><Pending inline>Rates TBC</Pending></dd>
            </div>
            <div className={styles.grand}>
              <dt>Total</dt>
              <dd>
                {cart.subtotal === null ? '—' : formatPrice(cart.subtotal)}
                {cart.subtotalIsEstimate && cart.subtotal !== null && <SampleTag />}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            className="btn btn--lg"
            onClick={() => setShowCheckoutNote(true)}
            aria-expanded={showCheckoutNote}
            aria-controls="checkout-note"
            data-cursor="ALMOST"
          >
            Checkout <Arrow className="btn__arrow" />
          </button>

          {showCheckoutNote && (
            <p id="checkout-note" className={styles.note} role="status">
              Checkout is not connected yet. Point this button at your commerce
              provider — the cart state, quantities and line items are already
              live and ready to hand over. See <code>README → Commerce</code>.
            </p>
          )}

          <p className={styles.fine}>
            Taxes, shipping rates, currency and payment methods are all awaiting
            client configuration.
          </p>

          <Link href="/wine" className={`link ${styles.keep}`}>Keep pouring</Link>
        </aside>
      </div>
    </Themed>
  );
}
