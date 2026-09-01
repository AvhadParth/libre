'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/products';
import { Themed } from './Themed';
import { SampleTag } from './Pending';
import { Arrow, Dots } from './brand/Marks';
import styles from './FinalCTA.module.css';

/**
 * The last thing on the page, and the only part of it that knows who is reading.
 *
 * The page now ends on where the wine comes from, so the honest next beat is
 * what you are actually leaving with. If there is something in the cart this
 * section shows it and offers checkout; if there is not, it points back up at
 * the shelf. Nothing else on the homepage responds to what the visitor has
 * done.
 *
 * What it deliberately no longer does:
 *
 * It used to headline "Just LIBRE." — which is the payoff the story section
 * spends its entire crossed-out sequence earning, and which the marquee says a
 * third time. Repeating a punchline does not reinforce it, it spends it, so the
 * words here are new.
 *
 * It also used to send people to /wine, a listing page, from below five working
 * add-to-cart buttons. Anyone who has scrolled this far has already been offered
 * the range; the useful link is forward to checkout, not back to a catalogue.
 *
 * And the bottle is a photograph now — the drawn BottleMark that stood here was
 * the last placeholder artwork left on the homepage.
 */
export function FinalCTA() {
  const cart = useCart();

  /*
   * The cart is read from localStorage after mount, so the first paint cannot
   * know it. Rather than flash the empty state and swap, the section holds a
   * reserved space until it does know — the height is fixed either way, so
   * nothing below it moves when the answer arrives.
   */
  const ready = cart.hydrated;
  const filled = ready && cart.count > 0;
  const bottles = cart.count === 1 ? 'bottle' : 'bottles';

  return (
    <Themed theme="cream" className={styles.section}>
      <Dots className={styles.dots} size={30} radius={2.4} />

      <div className={`shell ${styles.inner}`} data-state={!ready ? 'pending' : filled ? 'full' : 'empty'}>
        {filled ? (
          <>
            <div className={styles.copy}>
              <p className={styles.eyebrow}>Ready when you are</p>
              <h2 className={`display display--l ${styles.title}`}>
                {cart.count} {bottles} waiting.
              </h2>

              <ul className={styles.lines}>
                {cart.lines.map((line) => (
                  <li key={line.slug} className={styles.line}>
                    <img
                      className={styles.thumb}
                      src={`/photography/shelf/${line.slug}.webp`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.lineName}>{line.product.name}</span>
                    <span className={styles.lineQty}>×{line.qty}</span>
                    <span className={styles.linePrice}>
                      {line.product.price === null
                        ? '—'
                        : formatPrice(line.product.price * line.qty, line.product.currency)}
                    </span>
                  </li>
                ))}
              </ul>

              <p className={styles.total}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span className={styles.totalValue}>
                  {cart.subtotal === null ? '—' : formatPrice(cart.subtotal)}
                  {cart.subtotalIsEstimate && <SampleTag />}
                </span>
              </p>

              <div className={styles.actions}>
                <Link href="/cart" className={`btn btn--lg btn--accent ${styles.cta}`} data-cursor="LET'S POUR">
                  Checkout <Arrow className="btn__arrow" />
                </Link>
                <a href="#shop" className={styles.secondary} data-cursor="ONE MORE">
                  Add another
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Nothing in the basket</p>
            <h2 className={`display display--l ${styles.title}`}>Empty-handed?</h2>
            <p className={styles.lede}>
              Five bottles, all 0.0%, all a few scrolls back up.
            </p>
            <div className={styles.actions}>
              <a href="#shop" className={`btn btn--lg btn--accent ${styles.cta}`} data-cursor="LET'S POUR">
                Pick a bottle <Arrow className="btn__arrow" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Themed>
  );
}
