import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { PendingNote } from '@/components/Pending';
import { Arrow } from '@/components/brand/Marks';
import { legalDoc, legalDocs, type Block, type Inline } from '@/lib/legal';
import styles from './legal.module.css';

/**
 * The legal documents.
 *
 * Privacy, Terms and Contact & Grievance are rendered from the Markdown in
 * `content/legal/`, so the copy is edited in one file and the page follows.
 * Accessibility has no supplied copy yet and keeps its structural placeholder —
 * inventing legalese would be worse than admitting the gap.
 *
 * Typography: these are documents, not posters. Chantal sets the page title and
 * nothing else; every heading, clause and list is Avenir, which is the face
 * built to be read at length and the only one with a complete character set.
 */

const PLACEHOLDERS = {
  accessibility: {
    title: 'Accessibility',
    intro: 'Our commitment, and how to tell us when we have fallen short.',
    sections: [
      'Standards we work to',
      'What we have done',
      'Known limitations',
      'Reporting a problem',
    ],
  },
} as const;

type Placeholder = keyof typeof PLACEHOLDERS;

export function generateStaticParams() {
  return [
    ...legalDocs().map((d) => ({ doc: d.slug })),
    ...Object.keys(PLACEHOLDERS).map((doc) => ({ doc })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = legalDoc(doc);
  if (entry) return { title: entry.title, description: entry.description };
  const fallback = PLACEHOLDERS[doc as Placeholder];
  return fallback ? { title: fallback.title, description: fallback.intro } : { title: 'Not found' };
}

/* ---------------------------------------------------------------- inline --- */

function Parts({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === 'strong') return <strong key={i}>{part.text}</strong>;
        if (part.kind === 'em') return <em key={i}>{part.text}</em>;
        /*
         * A gap in the template, marked rather than printed plain.
         *
         * These documents arrived full of [Company Legal Name] and [Insert
         * Date]. Set as ordinary body copy they read as finished sentences and
         * would go live unnoticed; marked, nobody can publish them by accident.
         */
        if (part.kind === 'blank')
          return (
            <mark key={i} className={styles.blank} title="Awaiting client supply">
              [{part.text}]
            </mark>
          );
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}

/** Lines within one paragraph are real breaks — the contact blocks need them. */
function Lines({ lines }: { lines: Inline[][] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          <Parts parts={line} />
        </span>
      ))}
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'heading')
          return (
            <h2 key={i} className={styles.heading}>
              {block.number && <span className={styles.headingNo}>{block.number}</span>}
              <span>
                <Parts parts={block.text} />
              </span>
            </h2>
          );

        if (block.kind === 'para')
          return (
            <p key={i} className={styles.para}>
              <Lines lines={block.lines} />
            </p>
          );

        if (block.kind === 'rule') return <hr key={i} className={styles.rule} />;

        const Tag = block.ordered ? 'ol' : 'ul';
        return (
          <Tag key={i} className={block.ordered ? styles.ordered : styles.bullets}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Parts parts={item} />
              </li>
            ))}
          </Tag>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ page --- */

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const entry = legalDoc(doc);
  const fallback = PLACEHOLDERS[doc as Placeholder];
  if (!entry && !fallback) notFound();

  const others = legalDocs().filter((d) => d.slug !== doc);

  return (
    <Themed theme="cream" className={styles.page} flush>
      <article className={`shell ${styles.inner}`}>
        <header className={styles.head}>
          <Reveal variant="mask">
            <h1 className={`display display--m ${styles.title}`}>
              {entry ? entry.title : fallback.title}
            </h1>
          </Reveal>
          {entry?.updated && (
            <p className={styles.updated}>
              Last updated{' '}
              {/* Marked only while it is still a bracketed placeholder — once a
                  real date is filled in it should read as an ordinary date. */}
              {/^\[.*\]$/.test(entry.updated) ? (
                <mark className={styles.blank} title="Awaiting client supply">
                  {entry.updated}
                </mark>
              ) : (
                entry.updated
              )}
            </p>
          )}
          {!entry && <p className="lede">{fallback.intro}</p>}
        </header>

        {entry ? (
          <>
            {/*
              The advisory the document carries, kept where a reader and the
              client both see it. It is not body copy — it is the note saying
              this text has not been through a lawyer yet.
            */}
            {(entry.note || entry.blanks > 0) && (
              /*
                Not PendingNote — that is a short all-caps banner, and this runs
                to two sentences on a page whose whole job is being readable.
              */
              <aside className={styles.advisory}>
                {entry.blanks > 0 && (
                  <p>
                    <strong>
                      {entry.blanks} highlighted {entry.blanks === 1 ? 'detail is' : 'details are'}{' '}
                      still awaiting client supply.
                    </strong>
                  </p>
                )}
                {entry.note && <p>{entry.note}</p>}
              </aside>
            )}

            <div className={styles.doc}>
              <Blocks blocks={entry.blocks} />
            </div>
          </>
        ) : (
          <>
            <PendingNote>
              This document is a structural placeholder. Copy must be supplied and
              approved by the client before this site goes live.
            </PendingNote>
            <div className={styles.doc}>
              {fallback.sections.map((section, i) => (
                <div key={section}>
                  <h2 className={styles.heading}>
                    <span className={styles.headingNo}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{section}</span>
                  </h2>
                  <p className={styles.placeholder}>Copy awaiting client supply.</p>
                </div>
              ))}
            </div>
          </>
        )}

        <nav className={styles.also} aria-label="Other legal documents">
          <h2 className={styles.alsoHead}>Also here</h2>
          <ul>
            {others.map((d) => (
              <li key={d.slug}>
                <Link href={`/legal/${d.slug}`} className="link">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/" className="btn">
          Back to LIBRE <Arrow className="btn__arrow" />
        </Link>
      </article>
    </Themed>
  );
}
