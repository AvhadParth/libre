import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, products } from '@/lib/products';
import { ProductHero } from '@/components/ProductHero';
import { WhatsInside } from '@/components/WhatsInside';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { Marquee } from '@/components/Marquee';
import { Arrow } from '@/components/brand/Marks';
import styles from './product.module.css';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Not found' };
  return {
    title: product.name,
    description: `${product.personality} ${product.blurb}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <>
      <ProductHero product={product} />

      <Marquee
        items={[product.personality, 'No occasion required', 'Wine without the rules']}
        speed={30}
      />

      <WhatsInside product={product} />

      {/*
        A short row, not a second catalogue. The old block ran to 2,100px of
        full product cards — a whole page of browsing appended to the page you
        had already chosen. Four cut-outs and a name is enough to move sideways.
      */}
      <Themed theme="cream" className={styles.more}>
        <div className={`shell ${styles.moreHead}`}>
          <Reveal variant="mask">
            <h2 className={`display display--m ${styles.moreTitle}`}>Or maybe one of these.</h2>
          </Reveal>
          <Link href="/wine" className="link">
            All the wine <Arrow className={styles.arrow} />
          </Link>
        </div>
        <ul className={`shell ${styles.moreRow}`}>
          {others.map((other) => (
            <li key={other.slug}>
              <Link href={`/wine/${other.slug}`} className={styles.otherLink} data-cursor="MEET IT">
                <span className={styles.otherArt} data-theme={other.theme}>
                  <img
                    src={`/photography/cards/${other.slug}-cutout.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className={styles.otherName}>{other.name}</span>
                <span className={styles.otherLine}>{other.personality}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Themed>
    </>
  );
}
