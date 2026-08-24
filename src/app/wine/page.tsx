import type { Metadata } from 'next';
import { ProductShowcase } from '@/components/ProductShowcase';
import { VibeSelector } from '@/components/VibeSelector';
import { FinalCTA } from '@/components/FinalCTA';
import { Marquee } from '@/components/Marquee';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { Scribble } from '@/components/brand/Marks';
import { PendingNote } from '@/components/Pending';
import styles from './wine.module.css';

export const metadata: Metadata = {
  title: 'The Wine',
  description:
    'The LIBRE range: two dealcoholized wines and three alcohol-free sparkling ' +
    'grape beverages, from Extremadura, Spain. No rules attached.',
};

export default function WinePage() {
  return (
    <>
      <Themed theme="vine" className={styles.hero} flush>
        <div className={`shell ${styles.heroInner}`}>
          <Reveal variant="mask">
            <h1 className={`display display--hero ${styles.title}`}>
              The{' '}
              <span className="marked">
                wine.
                <Scribble kind="underline" />
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="lede">
              Five bottles. None of them need an occasion, a speech or the
              correct glass.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <PendingNote>
              Names, prices, formats, ingredients and nutrition are taken from
              the supplied labels. Tasting notes and food pairings are still
              awaiting client supply.
            </PendingNote>
          </Reveal>
        </div>
      </Themed>

      <Marquee items={['Pop it', 'Pour it', 'Let the stories do the rest']} speed={34} />

      <ProductShowcase heading="Pick a bottle" />
      <VibeSelector />
      <FinalCTA />
    </>
  );
}
