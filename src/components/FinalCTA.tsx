'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { burstFrom } from './brand/Confetti';
import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { Arrow, BottleMark, Dots, Glass, Grape, Scribble } from './brand/Marks';
import styles from './FinalCTA.module.css';

/**
 * The last page of the magazine.
 *
 * Everything the site has been throwing around comes back — grape, glass,
 * scribble, dot — and then all of it goes quiet around one bottle on Cava
 * Cream. The only loud thing left is the invitation.
 */
export function FinalCTA() {
  const cta = useRef<HTMLAnchorElement>(null);

  return (
    <Themed theme="cream" className={styles.section}>
      <Dots className={styles.dots} size={30} radius={2.4} />

      {/* the cast, returning quietly */}
      <Grape className={`${styles.mark} ${styles.markA}`} />
      <Glass className={`${styles.mark} ${styles.markB}`} level={0.5} liquid="var(--rouge)" />
      <Scribble kind="wave" className={`${styles.mark} ${styles.markC}`} />
      <Grape className={`${styles.mark} ${styles.markD}`} />

      <div className={styles.inner}>
        <Reveal variant="scale">
          <div className={styles.bottle}>
            <BottleMark glass="var(--vine)" foil="var(--sol)" ink="var(--rouge)" label="var(--cream)" />
          </div>
        </Reveal>

        <Reveal variant="mask" delay={0.1}>
          <h2 className={`display display--hero ${styles.title}`}>Just LIBRE.</h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className={`lede ${styles.line}`}>
            Pop it. Pour it. Let the stories do the rest.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <Link
            ref={cta}
            href="/wine"
            className={`btn btn--lg btn--accent ${styles.cta}`}
            data-cursor="LET'S POUR"
            onMouseEnter={() => burstFrom(cta.current, { count: 26, power: 0.6 })}
          >
            Shop LIBRE <Arrow className="btn__arrow" />
          </Link>
        </Reveal>
      </div>
    </Themed>
  );
}
