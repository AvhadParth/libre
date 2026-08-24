'use client';

import { createElement, type ReactNode } from 'react';
import type { ThemeName } from '@/lib/products';
import styles from './Themed.module.css';

/**
 * A section of the colour journey.
 *
 * Each themed block paints its OWN ground and text, so contrast is guaranteed
 * at every scroll position — there is never a frame where a cross-fading
 * background and foreground pass through each other. The travel between
 * colours is handled by designed transitions (liquid wipe, dot field, curve),
 * not by a blind CSS cross-fade.
 */
export function Themed({
  theme,
  as = 'section',
  className,
  children,
  id,
  flush = false,
  ...rest
}: {
  theme: ThemeName;
  as?: 'section' | 'div' | 'footer' | 'header' | 'main' | 'article';
  className?: string;
  children: ReactNode;
  id?: string;
  flush?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return createElement(
    as,
    {
      id,
      'data-theme': theme,
      className: [styles.themed, flush ? '' : styles.padded, className]
        .filter(Boolean)
        .join(' '),
      ...rest,
    },
    children,
  );
}
