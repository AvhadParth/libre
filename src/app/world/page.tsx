import type { Metadata } from 'next';
import Link from 'next/link';
import { ORIGIN } from '@/lib/products';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { WorldActs } from '@/components/WorldActs';
import { ACT_INDEX } from '@/lib/world-acts';
import { Dots, Scribble } from '@/components/brand/Marks';
import styles from './world.module.css';

export const metadata: Metadata = {
  title: 'The World',
  description:
    'Pop, pour, feel, share, celebrate — the five things LIBRE is for, and the ' +
    'only instructions it comes with.',
};

/**
 * The world according to LIBRE — the five verbs, given the whole page.
 *
 * What this page used to be, and why it is not any more:
 *
 * Five of its eight sections said something the homepage already says. The
 * struck-through list of wine's rules is the same device and the same argument
 * as the story section; the Extremadura block, its facts and its flat map are
 * all done better by the origin section, which draws the map as vectors and
 * magnifies into the town. The scrapbook is shot briefs and also runs on
 * /stories, and the closing CTA runs on two other pages.
 *
 * What was left that belonged only here is POP → POUR → FEEL → SHARE →
 * CELEBRATE — named in the guidelines as the interaction language of the whole
 * brand, and previously given a five-item list with an icon each. It is the
 * page now. Provenance keeps a single line pointing home rather than a second
 * copy of it.
 */
export default function WorldPage() {
  return (
    <>
      <Themed theme="cream" className={styles.hero} flush>
        <Dots className={styles.heroDots} size={30} radius={2.4} />

        <div className={`shell ${styles.heroInner}`}>
          <Reveal variant="mask">
            <h1 className={`display display--hero ${styles.heroTitle}`}>
              Five things{' '}
              <span className="marked">
                it’s for.
                <Scribble kind="underline" />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className={`lede ${styles.heroLede}`}>
              Wine arrived here with a long list of instructions. These are the
              only five we kept.
            </p>
          </Reveal>

          {/* The acts, as a contents page. */}
          <Reveal delay={0.2}>
            <ol className={styles.contents}>
              {ACT_INDEX.map((a) => (
                <li key={a.verb}>
                  <span className={styles.contentsNo}>{a.n}</span>
                  <span className={styles.contentsVerb}>{a.verb}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Themed>

      <WorldActs />

      {/*
        Provenance lives on the homepage now, where the map draws itself. One
        line and a link, rather than a second copy of the whole section.
      */}
      <Themed theme="cream" className={styles.coda}>
        <div className={`shell ${styles.codaInner}`}>
          <Reveal>
            <p className={styles.codaLine}>
              Made by {ORIGIN.house} in {ORIGIN.town}, {ORIGIN.province} — in{' '}
              {ORIGIN.subRegion}, {ORIGIN.country}. Since {ORIGIN.since}.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/#origin" className="link">
              See where it comes from
            </Link>
          </Reveal>
        </div>
      </Themed>
    </>
  );
}
