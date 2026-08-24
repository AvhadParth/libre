'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { products, type ThemeName } from '@/lib/products';
import { burstFrom } from './brand/Confetti';
import { playCue } from '@/lib/sound';
import { Arrow, BottleMark, Dots, Glass, Grape, Scribble } from './brand/Marks';
import { PendingNote } from './Pending';
import styles from './VibeSelector.module.css';

type Vibe = {
  id: string;
  label: string;
  theme: ThemeName;
  /** Drives graphic density and tempo — the room changes, not just the colour. */
  tempo: 'fast' | 'medium' | 'slow';
  motif: 'grape' | 'glass' | 'dots';
  line: string;
  /** Which bottle this points at. Mapping to be confirmed by the client. */
  product: string;
};

const VIBES: Vibe[] = [
  { id: 'out',   label: 'Going out',   theme: 'mist',  tempo: 'fast',   motif: 'grape', line: 'Started early, ending late.',        product: 'sparkling-rose' },
  { id: 'slow',  label: 'Slow morning',theme: 'cream', tempo: 'slow',   motif: 'dots',  line: 'Nothing before eleven.',             product: 'sauvignon-blanc-white' },
  { id: 'dinner',label: 'Dinner',      theme: 'rouge', tempo: 'medium', motif: 'glass', line: 'The good plates are out.',           product: 'merlot-red' },
  { id: 'mates', label: 'Friends',     theme: 'sol',   tempo: 'fast',   motif: 'grape', line: 'Six people, four chairs.',           product: 'sparkling-white' },
  { id: 'none',  label: 'No plans',    theme: 'vine',  tempo: 'slow',   motif: 'dots',  line: 'Best kind, honestly.',               product: 'sauvignon-blanc-white' },
  { id: 'party', label: 'Celebration', theme: 'azul',  tempo: 'fast',   motif: 'grape', line: 'Something happened. Or didn’t.',     product: 'gold-pearl' },
];

/**
 * Pick a mood and the room changes — ground, tempo, graphic density and the
 * bottle it hands you. It is a filter wearing better clothes: the answer is
 * always a real product page, never a dead end.
 */
export function VibeSelector() {
  const [active, setActive] = useState<Vibe>(VIBES[2]);
  const stage = useRef<HTMLDivElement>(null);

  const pick = (vibe: Vibe, event: React.MouseEvent<HTMLButtonElement>) => {
    setActive(vibe);
    playCue('tap', { volume: 0.3 });
    if (vibe.tempo === 'fast') burstFrom(event.currentTarget, { count: 34, power: 0.7 });
  };

  const recommended = products.find((p) => p.slug === active.product) ?? products[0];

  return (
    <section className={styles.section} data-theme={active.theme} data-tempo={active.tempo}>
      <Dots className={styles.dots} size={active.tempo === 'fast' ? 20 : 40} radius={2.6} />

      <div className={`shell ${styles.inner}`}>
        <header className={styles.head}>
          <h2 className={`display display--l ${styles.title}`}>
            What’s your{' '}
            <span className="marked">
              vibe?
              <Scribble kind="underline" />
            </span>
          </h2>
          <p className="body">Pick a mood. We’ll pick the bottle.</p>
        </header>

        <div className={styles.picker} role="group" aria-label="Choose a vibe">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              type="button"
              className={styles.chip}
              data-active={vibe.id === active.id}
              aria-pressed={vibe.id === active.id}
              onClick={(e) => pick(vibe, e)}
              data-cursor="THIS ONE"
            >
              {vibe.label}
            </button>
          ))}
        </div>

        <div ref={stage} className={styles.result} key={active.id}>
          <div className={styles.mood}>
            <p className={`display display--m ${styles.moodLine}`}>{active.line}</p>
            <span className={styles.motif} aria-hidden="true">
              {active.motif === 'grape' && <Grape />}
              {active.motif === 'glass' && <Glass level={0.6} liquid="currentColor" />}
              {active.motif === 'dots' && <Scribble kind="wave" />}
            </span>
          </div>

          <article className={styles.suggestion}>
            <div className={styles.suggestionArt} aria-hidden="true">
              <BottleMark glass="var(--accent)" foil="var(--bg)" ink="var(--rouge)" label="var(--bg)" />
            </div>
            <div className={styles.suggestionBody}>
              <p className="eyebrow">Then you want</p>
              <h3 className={`display display--m ${styles.suggestionName}`}>{recommended.name}</h3>
              <p className="body">{recommended.personality}</p>
              <Link href={`/wine/${recommended.slug}`} className="btn" data-cursor="MEET IT">
                Meet it <Arrow className="btn__arrow" />
              </Link>
            </div>
          </article>
        </div>

        <PendingNote>
          Vibe-to-product matching is provisional — to be confirmed against the
          final catalogue.
        </PendingNote>
      </div>
    </section>
  );
}
