import Link from 'next/link';
import { Themed } from '@/components/Themed';
import { Arrow, Glass } from '@/components/brand/Marks';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <Themed theme="rouge" className={styles.page} flush>
      <div className={styles.inner}>
        <Glass className={styles.glass} level={0} liquid="var(--accent)" />
        <h1 className={`display display--xl ${styles.title}`}>Empty glass.</h1>
        <p className="lede">
          This page does not exist. The bottle, thankfully, does.
        </p>
        <div className={styles.actions}>
          <Link href="/wine" className="btn btn--accent" data-cursor="LET'S POUR">
            Meet the wine <Arrow className="btn__arrow" />
          </Link>
          <Link href="/" className="link">Back to the start</Link>
        </div>
      </div>
    </Themed>
  );
}
