'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import type { Product } from '@/lib/products';
import { SHOW_SAMPLE_VALUES } from '@/lib/content-config';
import { prefersReducedMotion } from '@/lib/motion';
import { Grape } from './brand/Marks';
import { Pending, SampleTag } from './Pending';
import { Reveal } from './Reveal';
import styles from './FlavourProfile.module.css';

const SLOTS = 10;

/**
 * The flavour profile, measured in grapes.
 *
 * Ten slots per axis; the filled ones roll in one after another when the row
 * comes into view. Where the client has not approved a value the row keeps its
 * empty slots and says so — the shape of the answer is designed, the answer
 * itself is not invented.
 */
export function FlavourProfile({ product }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-axis]', el).forEach((row) => {
        gsap.fromTo(
          row.querySelectorAll('[data-on]'),
          { scale: 0, rotate: -90, opacity: 0 },
          {
            scale: 1, rotate: 0, opacity: 1,
            duration: 0.55, ease: 'back.out(2.2)', stagger: 0.045,
            scrollTrigger: { trigger: row, start: 'top 85%', once: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [product.slug]);

  const hasValues = product.flavour.some((axis) => axis.value !== null);

  return (
    <section className={styles.section} data-theme={product.altTheme} aria-labelledby="flavour-title">
      <div className={`shell ${styles.inner}`}>
        <Reveal variant="mask">
          <h2 id="flavour-title" className={`display display--l ${styles.title}`}>
            How does
            <br />
            it hit?
          </h2>
        </Reveal>

        <div ref={root} className={styles.axes}>
          {product.flavour.map((axis) => {
            const filled = axis.value === null ? 0 : Math.round((axis.value / 100) * SLOTS);
            return (
              <div key={axis.label} className={styles.axis} data-axis>
                <div className={styles.axisHead}>
                  <span className={styles.axisLabel}>{axis.label}</span>
                  {axis.value === null ? (
                    <Pending inline>Value TBC</Pending>
                  ) : (
                    <span className={styles.axisValue}>
                      {axis.value}
                      <span aria-hidden="true">/100</span>
                      {SHOW_SAMPLE_VALUES && <SampleTag />}
                    </span>
                  )}
                </div>

                <div
                  className={styles.meter}
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  {...(axis.value === null
                    ? { 'aria-valuetext': 'Awaiting client supply' }
                    : { 'aria-valuenow': axis.value })}
                  aria-label={`${axis.label}${axis.value === null ? ', value awaiting client supply' : ''}`}
                >
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <span
                      key={i}
                      className={styles.slot}
                      data-on={i < filled ? '' : undefined}
                      aria-hidden="true"
                    >
                      <Grape />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!hasValues && (
        <p className={`shell ${styles.note}`}>
          Flavour attributes shown are proposed for layout. Values and axis names
          require client approval before publication.
        </p>
      )}
    </section>
  );
}
