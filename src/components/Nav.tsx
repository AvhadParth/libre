'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useCart } from '@/lib/cart';
import { prefersReducedMotion } from '@/lib/motion';
import { startScroll, stopScroll } from './SmoothScroll';
import { Logo } from './brand/Logo';
import { Grape, Scribble } from './brand/Marks';
import { parseRgb, rgbToOklab } from '@/lib/colour';
import styles from './Nav.module.css';

const LINKS = [
  { href: '/world', label: 'The World' },
  { href: '/wine', label: 'The Wine' },
  { href: '/stories', label: 'The Stories' },
  /*
   * Shop lands on the buyable cards, not on the basket. This pointed at /cart,
   * so "Shop" took you to your own (usually empty) cart rather than to the
   * range — and the cart already has its own control at the end of the bar.
   * The hash puts you past the range page's editorial opening.
   */
  { href: '/wine#shop', label: 'Shop' },
];

export function Nav() {
  const pathname = usePathname();
  const cart = useCart();
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* The bar reads the colour of whatever is beneath it and inverts to match,
     so it is always legible and never needs its own opaque plate. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let frame = 0;

    /* Read the two ink colours off the stylesheet once, rather than keeping a
       second copy of the palette here. */
    const root = getComputedStyle(document.documentElement);
    const INK_DARK = root.getPropertyValue('--rouge').trim() || '#451326';
    const INK_LIGHT = root.getPropertyValue('--cream').trim() || '#FFF8E8';

    const opaqueBackgroundOf = (start: Element | null) => {
      let el: Element | null = start;
      while (el && el !== document.documentElement) {
        const c = getComputedStyle(el).backgroundColor;
        // skip transparent and fully-transparent rgba
        if (c && c !== 'transparent' && !/,\s*0\s*\)$/.test(c)) return c;
        el = el.parentElement;
      }
      return '';
    };

    const sample = () => {
      frame = 0;
      const y = 34;
      const x = Math.round(window.innerWidth / 2);
      const beneath = document
        .elementsFromPoint(x, y)
        .find((el) => !nav.contains(el));

      /*
       * Take the colour that is actually PAINTED beneath the bar, not the theme
       * name of the section it belongs to.
       *
       * Sections whose ground is interpolated per frame — the hero, and the
       * story section's turn — carry an inline --bg that no data-theme rule
       * knows about. Matching on the theme name left the bar painting a hard
       * slab of the section's nominal colour over a ground that had already
       * moved on, which is most obvious mid-blend. Reading the computed colour
       * means the bar merges through every section, blended or not.
       */
      /*
       * Some sections are film, and the bar must not lay a slab of their theme
       * colour over the footage. They opt out with data-nav="clear": the bar
       * keeps white ink, drops its scrim, and lets the picture run under it.
       */
      const clear = !!beneath?.closest?.('[data-nav="clear"]');
      nav.dataset.clear = clear ? 'true' : 'false';
      if (clear) {
        nav.style.setProperty('--fg', INK_LIGHT);
        nav.style.removeProperty('--bg');
        setScrolled(window.scrollY > 40);
        return;
      }

      const bg = opaqueBackgroundOf(beneath ?? null);
      if (bg) {
        nav.style.setProperty('--bg', bg);
        const light = rgbToOklab(parseRgb(bg))[0] > 0.6;
        nav.style.setProperty('--fg', light ? INK_DARK : INK_LIGHT);
      }

      /* Still published for anything keyed to the theme name. */
      const theme = beneath?.closest('[data-theme]')?.getAttribute('data-theme');
      if (theme) nav.dataset.theme = theme;
      setScrolled(window.scrollY > 40);
    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(sample); };
    sample();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /*
     * Sampling only on scroll is not enough. Sections above the fold can swap
     * themselves out after mount — the hero renders a themeless boot block
     * while it probes for WebGL, then replaces it with a themed track — and
     * nothing scrolls in between, so the bar would keep the colour it read off
     * the placeholder and go invisible against the real section.
     *
     * Watching the document box catches every such late layout change.
     */
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* Full-screen menu: scroll locked, focus trapped to Escape, type flies in. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (menuOpen) {
      stopScroll();
      document.body.style.overflow = 'hidden';
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          panel.querySelectorAll<HTMLElement>('[data-menu-item]'),
          { yPercent: 118, rotate: 4 },
          { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.06, ease: 'expo.out', delay: 0.1 },
        );
      }
      panel.querySelector<HTMLElement>('a,button')?.focus();
    } else {
      startScroll();
      document.body.style.overflow = '';
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      startScroll();
    };
  }, [menuOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={styles.nav}
        data-theme="cream"
        data-scrolled={scrolled ? 'true' : 'false'}
      >
        <Link href="/" className={styles.brand} aria-label="LIBRE — home" data-cursor="HOME">
          <Logo />
        </Link>

        <nav className={styles.links} aria-label="Primary">
          <ul>
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={styles.link}
                    data-active={active ? 'true' : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                    <Scribble kind="underline" className={styles.linkMark} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.right}>
          {/* The playful secondary mark from the brand kit. Decorative, never a control. */}
          <span className={styles.noRules} aria-hidden="true">
            <Grape className={styles.noRulesGrape} />
            No rules
          </span>

          <Link href="/cart" className={styles.cart} data-cursor="THE CART">
            <span className={styles.cartLabel}>Cart</span>
            <span className={styles.cartCount} data-has={cart.count > 0 ? 'true' : 'false'}>
              {cart.hydrated ? cart.count : 0}
            </span>
            <span className="sr-only">
              {cart.count === 1 ? '1 bottle in cart' : `${cart.count} bottles in cart`}
            </span>
          </Link>

          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="libre-menu"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className={styles.burgerBar} data-open={menuOpen} />
            <span className={styles.burgerBar} data-open={menuOpen} />
          </button>
        </div>
      </header>

      <div
        id="libre-menu"
        ref={panelRef}
        className={styles.panel}
        data-open={menuOpen}
        data-theme="rouge"
        inert={!menuOpen}
      >
        <ul className={styles.panelList}>
          {LINKS.map((link) => (
            <li key={link.href} className="clip">
              <Link href={link.href} className={styles.panelLink} data-menu-item>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.panelFoot} data-menu-item>
          Pop it. Pour it. Let the stories do the rest.
        </p>
      </div>
    </>
  );
}
