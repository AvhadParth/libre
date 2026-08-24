import Link from 'next/link';
import { Logo } from './brand/Logo';
import { Grape } from './brand/Marks';
import { Newsletter } from './Newsletter';
import { products } from '@/lib/products';
import { Themed } from './Themed';
import styles from './Footer.module.css';

/* Derived from the catalogue so the footer can never drift out of step with
   it — hand-listed slugs went stale the moment the real range landed. */
const SHOP = [
  { href: '/wine', label: 'All wine' },
  ...products.map((p) => ({ href: `/wine/${p.slug}`, label: p.name })),
  { href: '/cart', label: 'Cart' },
];

const WORLD = [
  { href: '/world', label: 'The World' },
  { href: '/stories', label: 'The Stories' },
  { href: '/wine', label: 'The Wine' },
];

/* ⚠ Social handles and contact details are PLACEHOLDERS awaiting client supply. */
const SOCIAL = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'TikTok' },
  { href: '#', label: 'Spotify' },
];

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/accessibility', label: 'Accessibility' },
];

export function Footer() {
  return (
    <Themed as="footer" theme="azul" className={styles.footer} flush>
      <div className={styles.goodbye}>
        <h2 className={`display display--xl ${styles.bye}`}>
          Okay.
          <br />
          Bye. <span className={styles.wave}>👋</span>
        </h2>
        <Grape className={styles.grape} />
      </div>

      <div className={styles.top}>
        <div className={styles.brandCol}>
          <Link href="/" aria-label="LIBRE — home">
            <Logo />
          </Link>
          <p className={styles.tagline}>Wine. Without the rules.</p>
        </div>
        <Newsletter compact />
      </div>

      <nav className={styles.columns} aria-label="Footer">
        <div>
          <h3 className={styles.colHead}>Shop</h3>
          <ul className={styles.list}>
            {SHOP.map((l) => (
              <li key={l.label}><Link href={l.href} className="link">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={styles.colHead}>The World</h3>
          <ul className={styles.list}>
            {WORLD.map((l) => (
              <li key={l.label}><Link href={l.href} className="link">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={styles.colHead}>Follow</h3>
          <ul className={styles.list}>
            {SOCIAL.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link" data-placeholder>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.pending}>Handles awaiting client supply</p>
        </div>
        <div>
          <h3 className={styles.colHead}>Contact</h3>
          <ul className={styles.list}>
            <li><span className={styles.pending}>Email awaiting client supply</span></li>
            <li><span className={styles.pending}>Address awaiting client supply</span></li>
          </ul>
        </div>
      </nav>

      <div className={styles.bottom}>
        <p className={styles.fine}>© {new Date().getFullYear()} LIBRE. All rights reserved.</p>
        <ul className={styles.legal}>
          {LEGAL.map((l) => (
            <li key={l.label}><Link href={l.href} className={styles.fineLink}>{l.label}</Link></li>
          ))}
        </ul>
        <p className={styles.fine}>
          Legal, regulatory and product copy to be supplied and approved by the client.
        </p>
      </div>
    </Themed>
  );
}
