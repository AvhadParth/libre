import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { PendingNote } from '@/components/Pending';
import { Arrow } from '@/components/brand/Marks';
import styles from './legal.module.css';

/**
 * Legal pages are structured and routed, but deliberately empty.
 *
 * Privacy, terms and accessibility copy carry legal weight and must be written
 * or approved by the client — placeholder legalese would be worse than none.
 */
const DOCS = {
  privacy: {
    title: 'Privacy',
    intro: 'How LIBRE handles personal data.',
    sections: [
      'What we collect',
      'Why we collect it',
      'Cookies and analytics',
      'Who we share it with',
      'How long we keep it',
      'Your rights',
      'Contacting us',
    ],
  },
  terms: {
    title: 'Terms',
    intro: 'The terms that apply to using this site and buying from it.',
    sections: [
      'Using this site',
      'Orders and pricing',
      'Shipping',
      'Returns and cancellations',
      'Age and eligibility',
      'Liability',
      'Governing law',
    ],
  },
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

type Doc = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = DOCS[doc as Doc];
  return entry ? { title: entry.title, description: entry.intro } : { title: 'Not found' };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const entry = DOCS[doc as Doc];
  if (!entry) notFound();

  return (
    <Themed theme="cream" className={styles.page} flush>
      <div className={`shell ${styles.inner}`}>
        <Reveal variant="mask">
          <h1 className={`display display--l ${styles.title}`}>{entry.title}</h1>
        </Reveal>
        <p className="lede">{entry.intro}</p>

        <PendingNote>
          This document is a structural placeholder. Legal copy must be supplied
          and approved by the client before this site goes live.
        </PendingNote>

        <ol className={styles.sections}>
          {entry.sections.map((section, i) => (
            <li key={section} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNo}>{String(i + 1).padStart(2, '0')}</span>
                {section}
              </h2>
              <p className={styles.placeholder}>Copy awaiting client supply.</p>
            </li>
          ))}
        </ol>

        <Link href="/" className="btn">
          Back to LIBRE <Arrow className="btn__arrow" />
        </Link>
      </div>
    </Themed>
  );
}
