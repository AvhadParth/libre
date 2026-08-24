'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { Frame } from './Frame';
import { Dots, Grape, Scribble } from './brand/Marks';
import styles from './Scrapbook.module.css';

/* Art-directed, not generated. Each item's place, angle and depth is a decision. */
const PIECES = [
  { brief: 'Bottle on a windowsill, curtain half-drawn, hard afternoon shadow across the label.', tone: 'sol' as const,   ratio: '3 / 4', depth: 0.9, area: 'a', rotate: -3 },
  { brief: 'Group shot from the wrong angle. Someone blinking. Keep it.',                          tone: 'mist' as const,  ratio: '4 / 3', depth: 0.4, area: 'b', rotate: 4 },
  { brief: 'Macro: condensation running down a glass, everything else out of focus.',              tone: 'cream' as const, ratio: '1 / 1', depth: 1.5, area: 'c', rotate: -6 },
  { brief: 'Feet under a table, shoes off, bottle standing on the floor between them.',            tone: 'rouge' as const, ratio: '4 / 5', depth: 0.7, area: 'd', rotate: 3 },
  { brief: 'A napkin with something written on it. Do not stage this — find a real one.',          tone: 'sol' as const,   ratio: '1 / 1', depth: 1.9, area: 'e', rotate: 8 },
];

/**
 * The collage. Mouse movement shifts each layer by its own depth, so the wall
 * has real space in it rather than a single flat parallax.
 */
export function Scrapbook() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el);
      const movers = layers.map((node) => ({
        node,
        depth: Number(node.dataset.depth ?? 1),
        x: gsap.quickTo(node, 'x', { duration: 1.1, ease: 'power3' }),
        y: gsap.quickTo(node, 'y', { duration: 1.1, ease: 'power3' }),
      }));

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        movers.forEach(({ depth, x, y }) => {
          x(px * depth * 46);
          y(py * depth * 34);
        });
      };

      el.addEventListener('pointermove', onMove, { passive: true });
      return () => el.removeEventListener('pointermove', onMove);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={styles.section} data-theme="azul">
      <Dots className={styles.dots} size={44} radius={3} />

      <div className={styles.board}>
        {PIECES.map((piece) => (
          <div
            key={piece.area}
            className={styles.piece}
            data-area={piece.area}
            data-depth={piece.depth}
          >
            <Frame brief={piece.brief} tone={piece.tone} ratio={piece.ratio} rotate={piece.rotate} />
          </div>
        ))}

        <p className={`display display--l ${styles.headline}`} data-depth="0.25">
          Everything
          <br />
          worth keeping
          <br />
          <span className="marked">
            happened anyway.
            <Scribble kind="underline" />
          </span>
        </p>

        <Grape className={styles.grapeA} data-depth="2.4" />
        <Grape className={styles.grapeB} data-depth="1.2" />
        <span className={styles.block} data-depth="0.6" aria-hidden="true" />
      </div>
    </section>
  );
}
