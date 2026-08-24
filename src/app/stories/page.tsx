import type { Metadata } from 'next';
import { StoryGallery } from '@/components/StoryGallery';
import { Scrapbook } from '@/components/Scrapbook';
import { ChaosButton } from '@/components/ChaosButton';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { Frame } from '@/components/Frame';
import { PendingNote } from '@/components/Pending';
import { Dots, Scribble } from '@/components/brand/Marks';
import { stories } from '@/lib/stories';
import styles from './stories.module.css';

export const metadata: Metadata = {
  title: 'The Stories',
  description:
    'Moments, tables and evenings that did not wait for an occasion. The LIBRE scrapbook.',
};

export default function StoriesPage() {
  const wall = [...stories, ...stories.slice(0, 3)];

  return (
    <>
      <Themed theme="azul" className={styles.hero} flush>
        <Dots className={styles.heroDots} size={26} radius={2.2} />
        <div className={`shell ${styles.heroInner}`}>
          <Reveal variant="mask">
            <h1 className={`display display--hero ${styles.title}`}>
              Our stories
              <br />
              <span className="marked">
                don’t wait.
                <Scribble kind="underline" />
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="lede">
              Nothing here was scheduled. That is the entire editorial policy.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <PendingNote>
              All photography, captions and locations are placeholders. Shot
              briefs are printed on each frame.
            </PendingNote>
          </Reveal>
        </div>
      </Themed>

      <StoryGallery />

      {/* The wall — deliberately imperfect, never a masonry grid. */}
      <Themed theme="cream" className={styles.wall}>
        <div className={`shell ${styles.wallHead}`}>
          <Reveal variant="mask">
            <h2 className="display display--l">The wall.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="body">Everything that did not fit anywhere else.</p>
          </Reveal>
        </div>

        <ul className={`shell ${styles.wallGrid}`}>
          {wall.map((story, i) => (
            <li key={`${story.id}-${i}`} className={styles.wallItem} data-i={i % 6}>
              <Reveal delay={(i % 4) * 0.06} variant="scale">
                <Frame
                  brief={story.brief}
                  tone={story.tone}
                  ratio={i % 3 === 0 ? '3 / 4' : i % 3 === 1 ? '1 / 1' : '4 / 3'}
                  rotate={i % 2 ? 2 : -2.4}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </Themed>

      <Scrapbook />
      <ChaosButton />
    </>
  );
}
