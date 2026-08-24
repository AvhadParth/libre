import Link from 'next/link';
import { products } from '@/lib/products';
import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { ProductCard } from './ProductCard';
import { Arrow, Scribble } from './brand/Marks';
import styles from './ProductShowcase.module.css';

/**
 * Product discovery as a question, not a shelf.
 * Five characters, each with its own way of behaving when you approach it.
 */
export function ProductShowcase({ heading = 'What are you pouring?' }: { heading?: string }) {
  return (
    <Themed theme="cream" id="wine" className={styles.section}>
      <div className={`shell ${styles.head}`}>
        <Reveal variant="mask">
          <h2 className={`display display--l ${styles.title}`}>
            What are you{' '}
            <span className="marked">
              pouring?
              <Scribble kind="underline" />
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="body">
            Five bottles. Two still, three sparkling, none of them serious.
            <span className="sr-only"> {heading}</span>
          </p>
        </Reveal>
      </div>

      <div className={`shell ${styles.grid}`}>
        {products.map((product, i) => (
          <Reveal key={product.slug} delay={i * 0.09} variant="rise">
            <ProductCard product={product} index={i} />
          </Reveal>
        ))}
      </div>

      <div className={`shell ${styles.foot}`}>
        <Link href="/wine" className="btn btn--lg" data-cursor="ALL OF IT">
          See the whole range <Arrow className="btn__arrow" />
        </Link>
      </div>
    </Themed>
  );
}
