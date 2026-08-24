import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, products } from '@/lib/products';
import { ProductHero } from '@/components/ProductHero';
import { WhatsInside } from '@/components/WhatsInside';
import { FlavourProfile } from '@/components/FlavourProfile';
import { PairingSection } from '@/components/PairingSection';
import { Themed } from '@/components/Themed';
import { Reveal } from '@/components/Reveal';
import { ProductCard } from '@/components/ProductCard';
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

      <div id="flavour">
        <FlavourProfile product={product} />
      </div>

      <WhatsInside product={product} />
      <PairingSection product={product} />

      <Themed theme="cream" className={styles.more}>
        <div className={`shell ${styles.moreHead}`}>
          <Reveal variant="mask">
            <h2 className="display display--m">Or maybe one of these.</h2>
          </Reveal>
          <Link href="/wine" className="link">
            All the wine <Arrow className={styles.arrow} />
          </Link>
        </div>
        <div className={`shell ${styles.moreGrid}`}>
          {others.map((other, i) => (
            <Reveal key={other.slug} delay={i * 0.08}>
              <ProductCard product={other} index={i} />
            </Reveal>
          ))}
        </div>
      </Themed>
    </>
  );
}
