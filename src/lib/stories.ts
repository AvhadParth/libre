import type { ThemeName } from './products';

/**
 * The brand's own world.
 *
 * This was previously a set of customer stories, and it could not be: no real
 * customer moment, quote, name or location has ever been supplied, so every
 * caption was sample text and every location read "Location TBC". A gallery
 * that presents authored copy beside a photograph as if someone said it is a
 * fabricated testimonial, however softly it is worded.
 *
 * So it is framed as what it actually is — the brand's own photography, with
 * captions in brand voice. `caption` is tone, never a claim and never
 * attributed to anyone. `place` is gone rather than invented.
 *
 * `brief` is kept because it is genuine art direction, and because the wall on
 * /stories still falls back to it for any entry without a photograph yet.
 */
export type Story = {
  id: string;
  /** Supplied photography. */
  src: string;
  alt: string;
  /** Brand voice. Tone, not testimony. */
  caption: string;
  /** Original art direction, retained for the photographer. */
  brief: string;
  /** How much of the strip this panel takes. */
  span: 'wide' | 'tall';
  tone: ThemeName;
  ratio: string;
  /** Which product this belongs to, where it is one bottle. */
  product: string | null;
};

export const stories: Story[] = [
  {
    id: 'st-01',
    src: '/photography/range-table-01.png',
    alt: 'All five LIBRE bottles on a dark marble table with dried flowers and glasses.',
    caption: 'The whole table, out.',
    brief: 'The range together, low warm light, everything already in use.',
    span: 'wide',
    tone: 'rouge',
    ratio: '4 / 3',
    product: null,
  },
  {
    id: 'st-02',
    src: '/photography/merlot-red-studio-02.png',
    alt: 'A poured glass of LIBRE Merlot beside the bottle, grapes on a marble board.',
    caption: 'Poured, not performed.',
    brief: 'Merlot with a glass already poured and grapes to hand.',
    span: 'tall',
    tone: 'rouge',
    ratio: '3 / 4',
    product: 'merlot-red',
  },
  {
    id: 'st-03',
    src: '/photography/sparkling-rose-studio-01.png',
    alt: 'LIBRE Sparkling Rosé beside a coupe glass and a single rose.',
    caption: 'Pink. Unbothered.',
    brief: 'Sparkling Rosé, a coupe, one rose. Nothing arranged too carefully.',
    span: 'tall',
    tone: 'mist',
    ratio: '3 / 4',
    product: 'sparkling-rose',
  },
  {
    id: 'st-04',
    src: '/photography/gold-pearl-studio-01.png',
    alt: 'LIBRE Gold Pearl on a stone plinth with a coupe glass and grapes.',
    caption: 'Shake for liquid gold.',
    brief: 'Gold Pearl catching light, arch shadow behind, coupe alongside.',
    span: 'tall',
    tone: 'azul',
    ratio: '3 / 4',
    product: 'gold-pearl',
  },
  {
    id: 'st-05',
    src: '/photography/sauvignon-blanc-white-studio-01.png',
    alt: 'LIBRE Sauvignon Blanc with a filled glass, stones and an olive branch.',
    caption: 'Cold, green, easy.',
    brief: 'Sauvignon Blanc on stone, olive branch, a glass already going.',
    span: 'tall',
    tone: 'vine',
    ratio: '3 / 4',
    product: 'sauvignon-blanc-white',
  },
  {
    id: 'st-06',
    src: '/photography/sparkling-white-studio-01.png',
    alt: 'LIBRE Sparkling White on a marble plinth with grapes and an olive branch.',
    caption: 'Bubbles, no occasion.',
    brief: 'Sparkling White, olive branch, grapes, plain cream ground.',
    span: 'tall',
    tone: 'sol',
    ratio: '3 / 4',
    product: 'sparkling-white',
  },
  {
    id: 'st-07',
    src: '/photography/merlot-red-studio-01.png',
    alt: 'LIBRE Merlot alone on a cream ground with a soft shadow.',
    caption: 'Red. Nought per cent.',
    brief: 'Merlot alone, minimal, the label doing all the work.',
    span: 'tall',
    tone: 'cream',
    ratio: '3 / 4',
    product: 'merlot-red',
  },
];
