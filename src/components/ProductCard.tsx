'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { formatPrice, type Product } from '@/lib/products';
import { prefersReducedMotion } from '@/lib/motion';
import { Arrow, BottleMark, Grape, Scribble, type ScribbleKind } from './brand/Marks';
import { Pending, SampleTag } from './Pending';
import styles from './ProductCard.module.css';

/* Each card behaves a little differently on purpose — three identical hover
   states would read as a template. Index picks the personality. */
const MARKS: ScribbleKind[] = ['circle', 'wave', 'underline'];
const TILTS = [-7, 5, -4];

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const card = useRef<HTMLDivElement>(null);
  const bottle = useRef<HTMLDivElement>(null);

  /* The bottle leans toward the pointer while it is over the card. */
  const onMove = (event: React.PointerEvent) => {
    if (prefersReducedMotion() || !card.current || !bottle.current) return;
    const rect = card.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(bottle.current, {
      rotate: TILTS[index % TILTS.length] + px * 9,
      x: px * 22,
      y: py * 14,
      duration: 0.9,
      ease: 'power3.out',
    });
  };

  const onLeave = () => {
    if (!bottle.current) return;
    gsap.to(bottle.current, {
      rotate: 0, x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)',
    });
  };

  return (
    <article
      className={styles.card}
      data-theme={product.theme}
      data-index={index}
      ref={card}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Link href={`/wine/${product.slug}`} className={styles.hit} data-cursor="MEET IT">
        <span className="sr-only">Meet {product.name}</span>
      </Link>

      <div className={styles.stage} aria-hidden="true">
        <Scribble kind={MARKS[index % MARKS.length]} className={styles.scribble} />
        <Grape className={styles.grape} />
        <div ref={bottle} className={styles.bottle}>
          {/* Knocked out of the colour block: the bottle takes the card's own
              ground, so every card is legible without a per-product exception. */}
          <BottleMark
            glass="var(--bg)"
            label="var(--fg)"
            ink="var(--bg)"
            foil="var(--accent-2)"
          />
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.personality}>{product.personality}</p>

        <h3 className={`display display--m ${styles.name}`}>
          {product.name}
          {product.variant ? (
            <span className={styles.variant}>{product.variant}</span>
          ) : (
            <span className={styles.variantPending}>
              <Pending inline>Variant name TBC</Pending>
            </span>
          )}
        </h3>

        <p className="body">{product.blurb}</p>

        <div className={styles.foot}>
          <span className={styles.price}>
            {product.price === null ? (
              <Pending inline>Price TBC</Pending>
            ) : (
              <>
                {formatPrice(product.price, product.currency)}
                {product.estimates.includes('price') && <SampleTag />}
              </>
            )}
          </span>

          {/* The label changes on approach — the invitation, not the instruction. */}
          <span className={`btn btn--ghost ${styles.cta}`}>
            <span className={styles.ctaRest}>View product</span>
            <span className={styles.ctaHover}>Let’s pour</span>
            <Arrow className="btn__arrow" />
          </span>
        </div>
      </div>
    </article>
  );
}
