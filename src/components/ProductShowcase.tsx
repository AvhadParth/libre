'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { products, formatPrice } from '@/lib/products';
import { prefersReducedMotion } from '@/lib/motion';
import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { SampleTag } from './Pending';
import { Arrow, Scribble } from './brand/Marks';
import styles from './ProductShowcase.module.css';

/**
 * The question, made answerable.
 *
 * The range stands together on one line at true relative scale — these are the
 * real bottles, not the drawn silhouette the cards used to show, and equal
 * height is honest because all five are 750ml and the cut-outs crop to within
 * 3% of the same aspect.
 *
 * Only the bottle you are on speaks. Five cards each carrying a personality
 * line, a name, a variant, a blurb, a price and a button put about 150 words in
 * one grid; a shelf with a single readout says the same thing with one product
 * described at a time, and lets the photography do the rest.
 */

/** Cut-outs sized for the shelf — 1000px tall WebP, ~65KB each. */
const shelfSrc = (slug: string) => `/photography/shelf/${slug}.webp`;

export function ProductShowcase({ heading = 'What are you pouring?' }: { heading?: string }) {
  const shelf = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /** Whether the visitor can actually hover. Decided after mount. */
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    setCanHover(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !prefersReducedMotion(),
    );
  }, []);

  /*
   * Touch and reduced-motion get the shelf stepped by scroll instead, so the
   * section is never inert for anyone who cannot hover. Nothing here depends on
   * a pointer existing.
   */
  useEffect(() => {
    const el = shelf.current;
    if (!el || canHover) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 78%',
        end: 'bottom 44%',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.max(0, Math.min(
            products.length - 1,
            Math.floor(self.progress * products.length),
          ));
          setActive((prev) => (prev === i ? prev : i));
        },
      });
    }, el);

    return () => ctx.revert();
  }, [canHover]);

  const current = products[active];

  return (
    <Themed theme="cream" id="wine" className={styles.section}>
      <div className={`shell ${styles.head}`}>
        <Reveal variant="mask">
          <h2 className={`display display--l ${styles.title}`}>
            What are you{' '}
            <span className="marked">
              pouring?
              <Scribble kind="underline" />
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className={`body ${styles.standfirst}`}>
            Five bottles. Two still, three sparkling, none of them serious.
            <span className="sr-only"> {heading}</span>
          </p>
        </Reveal>
      </div>

      <div ref={shelf} className={`shell ${styles.shelf}`}>
        <ul className={styles.row}>
          {products.map((product, i) => (
            <li
              key={product.slug}
              className={styles.slot}
              data-theme={product.theme}
              data-active={i === active || undefined}
            >
              <Link
                href={`/wine/${product.slug}`}
                className={styles.hit}
                data-cursor="MEET IT"
                onPointerEnter={() => canHover && setActive(i)}
                onFocus={() => setActive(i)}
              >
                {/* The active bottle sits in a pool of its own product colour —
                    identity without flipping the whole section's ground. */}
                <span className={styles.glow} aria-hidden="true" />
                <img
                  className={styles.bottle}
                  src={shelfSrc(product.slug)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="sr-only">
                  {product.name}
                  {product.variant ? `, ${product.variant}` : ''}
                  {product.price !== null
                    ? `, ${formatPrice(product.price, product.currency)}`
                    : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* One readout, not five. Reserved height so stepping along the shelf
            never shifts what is underneath it. */}
        <div className={styles.readout} aria-live="polite">
          <p className={styles.personality}>{current.personality}</p>
          <h3 className={`display display--m ${styles.name}`}>{current.name}</h3>
          <p className={styles.meta}>
            {current.variant ? <span>{current.variant}</span> : null}
            {current.price !== null ? (
              <span className={styles.price}>
                {formatPrice(current.price, current.currency)}
                {current.estimates.includes('price') && <SampleTag />}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className={`shell ${styles.foot}`}>
        <Link href="/wine" className="btn btn--lg" data-cursor="ALL OF IT">
          See the whole range <Arrow className="btn__arrow" />
        </Link>
      </div>
    </Themed>
  );
}
