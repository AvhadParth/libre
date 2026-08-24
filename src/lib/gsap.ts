'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Module bodies evaluate once, and registerPlugin is idempotent.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Physical, unhurried defaults. Individual tweens override where it matters.
  gsap.defaults({ ease: 'power3.out', duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };
