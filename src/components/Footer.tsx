import Link from 'next/link';
import { Logo } from './brand/Logo';
import { Scribble } from './brand/Marks';
import { Newsletter } from './Newsletter';
import { ORIGIN, products } from '@/lib/products';
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

/*
 * ⚠ No social handles have been supplied.
 *
 * Three links pointing at `#` under a "Follow" heading are worse than no links:
 * they look finished, they are keyboard-focusable, and they go nowhere. Until
 * real handles arrive the column states the platforms as plain text and says
 * so once, rather than three dead links plus a caveat underneath them.
 */
const PLATFORMS = ['Instagram', 'TikTok', 'Spotify'];

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/accessibility', label: 'Accessibility' },
];

export function Footer() {
  return (
    <Themed as="footer" theme="azul" className={styles.footer} flush>
      {/*
        The sign-off carries the one ask. The goodbye used to hold the left half
        and leave the right empty, with the newsletter pushed into a corner
        below it; putting them on one line gives the empty half a job and makes
        the last thing before the legal line a single clear invitation.
      */}
      <div className={styles.goodbye}>
        <div className={styles.sayBye}>
          <h2 className={`display display--xl ${styles.bye}`}>
            Let’s
            <br />
            Party.
          </h2>
          {/*
            The brand's own wave, not the system emoji that stood here. A `👋`
            renders as Apple's glossy hand on one machine and Google's flat one
            on another — it was the only emoji on the site, and the last image
            on every page was somebody else's illustration sitting next to
            Chantal. `wave` is one of the supplied scribbles.
          */}
          <Scribble kind="wave" className={styles.wave} />

          <Link href="/" aria-label="LIBRE — home" className={styles.mark}>
            <Logo />
          </Link>
          <p className={styles.tagline}>Wine. Without the rules.</p>
        </div>

        <div className={styles.signup}>
          <Newsletter compact />
        </div>
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
            {PLATFORMS.map((name) => (
              <li key={name}><span className={styles.platform}>{name}</span></li>
            ))}
          </ul>
          <p className={styles.pending}>Handles awaiting client supply</p>
        </div>
        <div>
          <h3 className={styles.colHead}>Contact</h3>
          {/* The house and the town are known and verified; the trading address
              and an enquiries inbox are not, so only the gap is flagged. */}
          <address className={styles.address}>
            {ORIGIN.house}
            <br />
            {ORIGIN.town}, {ORIGIN.province}
            <br />
            {ORIGIN.country}
          </address>
          <p className={styles.pending}>Enquiries address awaiting client supply</p>
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
