'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import {
  EXTREMADURA_PATH,
  MAP_TRANSFORM,
  MAP_VIEWBOX,
  PIN,
  SPAIN_PATHS,
} from '@/lib/spain-map';
import styles from './OriginStory.module.css';

/**
 * Where it comes from.
 *
 * Four beats on one scrub, in order: the coast of Spain draws itself, the
 * region it comes from fills, a pin drops on the town, and the map magnifies
 * about that pin until the region holds the frame — then the facts arrive and
 * it ends. Nothing flies, nothing bounces; the whole section is one continuous
 * move made of stroke-dashoffset, opacity and transform.
 *
 * The map is vector rather than the supplied JPEG precisely so the third beat
 * can happen: magnifying a 828px raster to fill a viewport would go to mush,
 * and an outline cannot draw itself at all. See src/lib/spain-map.ts.
 *
 * On the content: the brand's region asset also carries sourcing notes — how
 * production compares on cost to Rioja, and remarks about volume. Those are
 * internal positioning, not customer copy, and they argue against a premium
 * price, so nothing from that part of the sheet appears here. Everything below
 * is place, house, soil and climate.
 *
 * The photograph is atmosphere, deliberately unlabelled — it is not presented
 * as the estate itself, because nothing supplied confirms that it is.
 */

/** Verified against the brand region sheet and ORIGIN in lib/products.ts. */
const FACTS = [
  {
    k: 'Since 1943',
    v: 'Bodegas López Morenas has made wine at Fuente del Maestre, in the province of Badajoz.',
  },
  {
    k: 'Tierra de Barros',
    v: 'A subregion of the Ribera del Guadiana Denominación de Origen, in Extremadura.',
  },
  {
    k: 'Clay and limestone',
    v: 'Hot, dry summers and mild winters — the conditions that make ripe, fruit-forward wine.',
  },
];

export function OriginStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    /* Reduced motion gets the destination, not the journey: the section simply
       renders in its finished state and scrolls past like any other block. */
    if (prefersReducedMotion()) {
      el.dataset.static = 'true';
      return;
    }

    /* Marks that JS is driving. The copy's hidden start state is scoped to this
       attribute so that if the script never runs, the words are simply there. */
    el.dataset.animated = 'true';

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          /*
           * The stage is held by CSS `position: sticky`, not by ScrollTrigger's
           * pin. The section above this one pins with a 3,817px spacer, and a
           * second pin here was measured before that spacer applied — the range
           * came out exactly 3,817px too high, so the whole sequence had already
           * played by the time you reached it, and a refresh could not correct
           * it. Sticky needs no spacer and no refresh ordering.
           */
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });
      tl.to({}, { duration: 1 }, 0);

      /*
       * 1 — the coast draws itself.
       *
       * The dash is set from each path's OWN measured length rather than from
       * pathLength="1". Chrome computes dash values in screen space when
       * `vector-effect: non-scaling-stroke` is set, which makes it ignore
       * pathLength entirely: the dasharray stayed at 1px on a 14,989-unit path,
       * so the outline was a hair-fine dotted line that simply popped from
       * hidden to whole instead of drawing. Measuring is exact and needs no
       * support from either feature.
       */
      const coast = q('[data-coast]') as unknown as SVGPathElement[];
      coast.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });
      tl.to(coast, { strokeDashoffset: 0, duration: 0.34, ease: 'power1.inOut' }, 0.02);

      /* 2 — the region fills. */
      tl.fromTo(
        q('[data-region]'),
        { opacity: 0 },
        { opacity: 1, duration: 0.1, ease: 'power2.out' },
        0.34,
      );

      /* 3 — the town. */
      tl.fromTo(
        q('[data-pin]'),
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.07, ease: 'back.out(2)' },
        0.42,
      );
      tl.fromTo(
        q('[data-halo]'),
        { scale: 0.2, opacity: 0.9, transformOrigin: '50% 50%' },
        { scale: 1, opacity: 0, duration: 0.14, ease: 'power2.out' },
        0.44,
      );

      /*
       * 4 — the magnification, about the pin. transform-origin is set from the
       * pin's own coordinates in CSS, so this is a single scale rather than a
       * scale plus a hand-computed translation that would drift on resize.
       */
      tl.to(q('[data-map]'), { scale: 2.6, duration: 0.3, ease: 'power2.inOut' }, 0.5);
      /*
       * The region then steps aside and dims for the words.
       *
       * Cream on Sol Yellow is 1.6:1 — unreadable — and at full magnification
       * the region covers the whole column the copy sits in. Sliding it right
       * far enough right clears the text column outright, so the region can
       * keep more of its colour instead of going olive at low opacity.
       */
      tl.to(q('[data-map]'), { xPercent: 24, opacity: 0.5, duration: 0.16, ease: 'power2.out' }, 0.62);
      /* Thinned as the map magnifies, so the coastline holds the same weight on
         screen instead of ballooning with the scale. Same pre-scale units. */
      tl.to(q('[data-coast]'), { strokeWidth: 7, duration: 0.3 }, 0.5);
      /* The vineyard is most present while the coast draws; it recedes as the
         region and then the words take the frame. */
      tl.to(q('[data-veil]'), { opacity: 0.94, duration: 0.24 }, 0.52);
      tl.to(q('[data-shot]'), { scale: 1.16, duration: 0.44, ease: 'none' }, 0.42);

      /*
       * 5 — and the words.
       *
       * The hidden start state lives in CSS, not in a fromTo. A staggered
       * fromTo only pre-renders the FIRST target's from-values; the other five
       * lines sat at full opacity from the top of the section until their own
       * sub-tween began, so the copy was visible before the map had drawn.
       */
      tl.to(
        q('[data-line]'),
        { opacity: 1, y: 0, duration: 0.1, stagger: 0.045, ease: 'power2.out' },
        0.66,
      );
    }, el);

    /*
     * Re-measure once this trigger exists.
     *
     * Sections above this one pin, and a pin spacer is only added to the page
     * when its own trigger is built. This section is near the bottom, so at the
     * moment its trigger was first measured the page above it was still short —
     * it came out 3,800px high, which put the whole sequence at progress 1
     * before you ever reached it. A refresh after creation measures against the
     * page as it finally is.
     */
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={styles.section} data-theme="azul" aria-labelledby="origin-heading">
      <div className={styles.stage} data-stage>
        {/* Atmosphere. Held well back so it never competes with the map. */}
        <img
          className={styles.shot}
          src="/photography/vineyard.webp"
          alt=""
          data-shot
          loading="lazy"
          decoding="async"
        />
        <span className={styles.veil} data-veil aria-hidden="true" />

        <svg
          className={styles.map}
          data-map
          viewBox={MAP_VIEWBOX}
          role="img"
          aria-label="Map of Spain with Extremadura marked, and a pin on Fuente del Maestre"
          style={{
            transformOrigin: `${(PIN.x / 470) * 100}% ${(PIN.y / 544) * 100}%`,
          }}
        >
          <g transform={MAP_TRANSFORM}>
            <path className={styles.region} data-region d={EXTREMADURA_PATH} />
            {SPAIN_PATHS.map((d) => (
              <path key={d.slice(0, 24)} className={styles.coast} data-coast d={d} />
            ))}
          </g>
          <circle className={styles.halo} data-halo cx={PIN.x} cy={PIN.y} r={9} />
          <circle className={styles.pin} data-pin cx={PIN.x} cy={PIN.y} r={3.4} />
        </svg>

        <div className={styles.copy}>
          <p className={styles.eyebrow} data-line>
            Where it comes from
          </p>
          <h2 className={`display display--l ${styles.title}`} id="origin-heading" data-line>
            Fuente del Maestre
          </h2>

          <dl className={styles.facts}>
            {FACTS.map((f) => (
              <div key={f.k} className={styles.fact} data-line>
                <dt className={styles.factKey}>{f.k}</dt>
                <dd className={styles.factValue}>{f.v}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.close} data-line>
            Grown, picked and fermented like any wine from here. Then the alcohol
            comes out.
          </p>
        </div>
      </div>
    </section>
  );
}
