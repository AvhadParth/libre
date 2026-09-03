/**
 * The hang.
 *
 * Sizes are the art direction. The wall is a twelve-column grid with dense
 * packing, so the browser does the placement and this file decides only how
 * much wall each picture is worth — which is what stops nineteen plates from
 * reading as a folder export. The five plain packshots are deliberately the
 * smallest things on the wall; they punctuate the lifestyle pieces rather than
 * competing with them.
 *
 * Captions are the seven already written in `stories.ts`. The rest hang
 * untitled, which is what a real wall looks like — nothing here is invented to
 * fill a gap.
 */
export type Piece = {
  src: string;
  alt: string;
  /** Columns out of twelve. */
  span: number;
  /** width / height of the plate, so the frame reserves the right box. */
  ratio: number;
  caption?: string;
};

const L = 1100 / 871;   // the landscape plates
const T = 1100 / 880;
const P = 760 / 1142;   // studio and social portraits
const B = 760 / 963;    // the bubbles flat-lay
const K = 460 / 691;    // packshots

export const WALL: Piece[] = [
  { src: 'range-cafe-01', span: 7, ratio: L,
    alt: 'The five LIBRE bottles on a beachfront café table, city skyline behind.' },
  { src: 'merlot-red-studio-01', span: 3, ratio: P,
    alt: 'LIBRE Merlot standing alone in warm afternoon light.', caption: 'Red. Nought per cent.' },
  { src: 'merlot-red-pack-01', span: 2, ratio: K, alt: 'LIBRE Merlot, packshot.' },

  { src: 'range-table-01', span: 6, ratio: T,
    alt: 'All five bottles on a dark marble table with dried flowers and glasses.',
    caption: 'The whole table, out.' },
  { src: 'sparkling-rose-studio-01', span: 3, ratio: P,
    alt: 'LIBRE Sparkling Rosé beside a coupe glass and a single rose.', caption: 'Pink. Unbothered.' },
  { src: 'sauvignon-blanc-white-pack-01', span: 3, ratio: K, alt: 'LIBRE Sauvignon Blanc, packshot.' },

  { src: 'sparkling-rose-beach-01', span: 5, ratio: T,
    alt: 'LIBRE Sparkling Rosé on sand at sunset, a filled glass beside it.' },
  { src: 'gold-pearl-studio-01', span: 3, ratio: P,
    alt: 'LIBRE Gold Pearl on a stone plinth with a coupe glass and grapes.',
    caption: 'Shake for liquid gold.' },
  { src: 'sparkling-white-social-01', span: 4, ratio: P,
    alt: 'LIBRE Sparkling White poured among friends.' },

  { src: 'range-bubbles-01', span: 4, ratio: B,
    alt: 'The range arranged as a flat graphic composition on coloured circles.' },
  { src: 'sparkling-white-studio-01', span: 3, ratio: P,
    alt: 'LIBRE Sparkling White with an olive branch and grapes.', caption: 'Bubbles, no occasion.' },
  { src: 'sparkling-rose-pack-01', span: 2, ratio: K, alt: 'LIBRE Sparkling Rosé, packshot.' },

  { src: 'sparkling-white-beach-01', span: 6, ratio: T,
    alt: 'LIBRE Sparkling White in a net bag on a blanket, glass alongside.' },
  { src: 'sauvignon-blanc-white-studio-01', span: 3, ratio: P,
    alt: 'LIBRE Sauvignon Blanc with a filled glass, stones and an olive branch.',
    caption: 'Cold, green, easy.' },
  { src: 'gold-pearl-social-01', span: 3, ratio: P, alt: 'LIBRE Gold Pearl, poured and shared.' },

  { src: 'gold-pearl-pack-01', span: 2, ratio: K, alt: 'LIBRE Gold Pearl, packshot.' },
  { src: 'range-table-02', span: 5, ratio: T,
    alt: 'The range on a warm table with a red drape and grapes.' },
  { src: 'merlot-red-studio-02', span: 3, ratio: P,
    alt: 'A poured glass of LIBRE Merlot beside the bottle, grapes on a marble board.',
    caption: 'Poured, not performed.' },
];

export const plate = (src: string) => `/photography/wall/${src}.webp`;
