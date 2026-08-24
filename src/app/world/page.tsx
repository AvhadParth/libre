import type { Metadata } from 'next';
import { ORIGIN } from '@/lib/products';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { Frame } from '@/components/Frame';
import { Marquee } from '@/components/Marquee';
import { Scrapbook } from '@/components/Scrapbook';
import { FinalCTA } from '@/components/FinalCTA';
import { Dots, Grape, Scribble } from '@/components/brand/Marks';
import styles from './world.module.css';

export const metadata: Metadata = {
  title: 'The World',
  description:
    'The world according to LIBRE: freedom, joy and expression, with none of the rules wine picked up on the way here.',
};

/* The rules wine accumulated — printed, then struck through. */
const RULES = [
  'Wait for an occasion.',
  'Learn the right words.',
  'Use the correct glass.',
  'Know the year.',
  'Make the face.',
  'Explain why you’re not drinking.',
];

/* The interaction language of the whole brand, stated plainly once. */
const STEPS = [
  { verb: 'Pop', line: 'The sound that starts the evening.' },
  { verb: 'Pour', line: 'Generously. It is not a tasting.' },
  { verb: 'Feel', line: 'Whatever the room is doing.' },
  { verb: 'Share', line: 'The bottle, the table, the story.' },
  { verb: 'Celebrate', line: 'Or don’t. Tuesday counts.' },
];

/**
 * Regional facts, transcribed from the supplied producer sheet. Wording is
 * corrected for spelling only — no claim has been added or embellished.
 */
const ORIGIN_FACTS = [
  { label: 'Wine area', value: 'Tierra de Barros, Ribera del Guadiana DO' },
  { label: 'Climate', value: 'Continental-Mediterranean — hot, dry summers and mild winters' },
  { label: 'Soils', value: 'Clay-limestone (“barros”)' },
  { label: 'Key varieties', value: 'Pardina, Cayetana Blanca, Macabeo, Verdejo' },
  { label: 'Winemakers since', value: '1943' },
] as const;

export default function WorldPage() {
  return (
    <>
      <Themed theme="rouge" className={styles.hero} flush>
        <Dots className={styles.heroDots} size={30} radius={2.4} />
        <div className={`shell ${styles.heroInner}`}>
          <Reveal variant="mask">
            <h1 className={`display display--hero ${styles.title}`}>
              The world
              <br />
              according to
              <br />
              <span className={styles.accent}>LIBRE.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="lede">
              Freedom, joy and expression — and a short list of things we left behind.
            </p>
          </Reveal>
        </div>
      </Themed>

      {/* ------------------------------------------------------- the rules --- */}
      <Themed theme="cream" className={styles.rules}>
        <div className={`shell ${styles.rulesHead}`}>
          <Reveal variant="mask">
            <h2 className={`display display--l ${styles.rulesTitle}`}>
              The rules,
              <br />
              <span className="marked">
                crossed out.
                <Scribble kind="underline" />
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="body">
              None of these ever made a single evening better. Wine collected
              them anyway.
            </p>
          </Reveal>
        </div>

        <ol className={`shell ${styles.ruleList}`}>
          {RULES.map((rule, i) => (
            <li key={rule} className={styles.rule}>
              <Reveal variant="slide" delay={i * 0.06}>
                <span className={styles.ruleRow}>
                  <span className={styles.ruleNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.ruleText}>
                    {rule}
                    <Scribble kind="slash" className={styles.ruleStrike} />
                  </span>
                </span>
              </Reveal>
            </li>
          ))}
        </ol>
      </Themed>

      <Marquee items={['Pure joy', 'No occasion required', 'Just LIBRE']} speed={38} reverse />

      {/* --------------------------------------------------- pop → pour → --- */}
      <Themed theme="vine" className={styles.how}>
        <div className={`shell ${styles.howHead}`}>
          <Reveal variant="mask">
            <h2 className="display display--l">How to LIBRE.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="body">Five steps. Four of them optional.</p>
          </Reveal>
        </div>

        <ol className={`shell ${styles.steps}`}>
          {STEPS.map((step, i) => (
            <li key={step.verb} className={styles.step} data-i={i}>
              <Reveal delay={i * 0.07}>
                <div className={styles.stepInner}>
                  <Grape className={styles.stepGrape} />
                  <h3 className={`display display--m ${styles.stepVerb}`}>{step.verb}</h3>
                  <p className="caption">{step.line}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Themed>

      {/* --------------------------------------------------------- pillars --- */}
      <Themed theme="mist" className={styles.pillars}>
        <div className={`shell ${styles.pillarGrid}`}>
          <Reveal className={styles.pillarCopy} as="div" variant="lines">
            <h2 className="display display--l">Where it came from.</h2>
            <p className="body body--wide">
              LIBRE started from a simple observation: the best parts of wine
              culture — the table, the noise, the sense that the evening has
              properly begun — never actually depended on the alcohol.
            </p>
            <p className="body body--wide">
              So we kept those, and let the rest go. What is left is a
              non-alcoholic wine designed around freedom, joyful expression and
              social connection, made to be opened without an occasion.
            </p>
          </Reveal>

          <div className={styles.pillarArt}>
            <Frame
              brief="Documentary: a table being set badly and quickly by two people who are already talking."
              tone="rouge" ratio="4 / 5" rotate={-3}
            />
            <Frame
              brief="Detail: an open bottle in the middle of a table, everything around it in motion."
              tone="sol" ratio="1 / 1" rotate={5} className={styles.pillarArtSmall}
            />
          </div>
        </div>
      </Themed>

      {/* ------------------------------------------------------- provenance --- */}
      <Themed theme="cream" className={styles.origin}>
        <div className={`shell ${styles.originGrid}`}>
          <Reveal className={styles.originCopy} as="div" variant="lines">
            <p className="eyebrow">Vino de España</p>
            <h2 className="display display--l">
              Made in{' '}
              <span className="marked">
                {ORIGIN.region}.
                <Scribble kind="underline" />
              </span>
            </h2>
            <p className="body body--wide">
              Every bottle is made by {ORIGIN.house} in {ORIGIN.town},{' '}
              {ORIGIN.province} — in the {ORIGIN.subRegion} sub-region of the{' '}
              {ORIGIN.appellation}. They have been making wine there since{' '}
              {ORIGIN.since}.
            </p>
            <dl className={styles.originFacts}>
              {ORIGIN_FACTS.map((fact) => (
                <div key={fact.label} className={styles.originFact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <figure className={styles.originMap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/region-extremadura.jpeg"
              alt={`Map of Spain with ${ORIGIN.region} highlighted, marking ${ORIGIN.town}, home of ${ORIGIN.house}.`}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="caption">
              {ORIGIN.town}, {ORIGIN.province}
            </figcaption>
          </figure>
        </div>
      </Themed>

      <Scrapbook />
      <FinalCTA />
    </>
  );
}
