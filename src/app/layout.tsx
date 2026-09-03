import { SITE_URL } from '@/lib/site';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { SmoothScroll } from '@/components/SmoothScroll';
import { CustomCursor } from '@/components/CustomCursor';
import { ConfettiLayer } from '@/components/brand/Confetti';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { PageTransition } from '@/components/PageTransition';
import { SoundToggle } from '@/components/SoundToggle';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LIBRE — Wine without the rules',
    template: '%s — LIBRE',
  },
  description:
    'LIBRE is alcohol-free wine from Extremadura, Spain, for a generation ' +
    'that never needed an occasion. Pop it. Pour it. Let the stories do the rest.',
  applicationName: 'LIBRE',
  icons: { icon: '/brand/grape.svg' },
  openGraph: {
    title: 'LIBRE — Wine without the rules',
    description:
      'Alcohol-free wine from Spain, reimagined. Pop it. Pour it. Let the stories do the rest.',
    siteName: 'LIBRE',
    locale: 'en_IN',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FFF8E8',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The brand faces are self-hosted from /public/fonts — see globals.css.
            Permanent Marker and Mulish are fallbacks only, folded into a single
            request. Neither downloads while the licensed faces are present. */}
        <link
          rel="preload"
          href="/fonts/Chantal-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AvenirLTPro-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Mulish:wght@200;300;400;500&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <CartProvider>
          <SmoothScroll />
          <CustomCursor />
          <ConfettiLayer />
          <PageTransition />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <SoundToggle />
        </CartProvider>
      </body>
    </html>
  );
}
