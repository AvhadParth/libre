/**
 * CONTENT TRUTH SWITCH
 * ============================================================================
 * No product fact on this site is invented. Names, prices, volumes, ingredients,
 * nutrition, flavour values and food pairings are ALL awaiting client supply.
 *
 * `SHOW_SAMPLE_VALUES` exists so the design, motion and commerce flows can be
 * reviewed with something in them. Every value it switches on is rendered with
 * a visible SAMPLE marker so it can never be mistaken for approved copy.
 *
 * >>> Set to `false` to see the true empty state (dashed "awaiting content" slots).
 * >>> Delete this flag entirely once the real catalogue lands in products.ts.
 */
export const SHOW_SAMPLE_VALUES = true;

/** Placeholder image slots render as art-directed brand compositions + a shot brief. */
export const SHOW_SHOT_BRIEFS = true;

export const BRAND = {
  name: 'LIBRE',
  shortName: 'LIBRE',
  tagline: 'Wine. Without the rules.',
  descriptor: 'Vino de España',
  /** Approved brand language, transcribed from the 2026 guidelines. */
  approved: {
    popPour: 'Pop it. Pour it. Let the stories do the rest.',
    joy: 'Pure joy.',
    storiesWait: 'Our stories don’t wait.',
    beginPour: 'They begin with a pour.',
    drinkWhat: 'Drink what you feel like.',
    presence: 'Presence. Togetherness. Quietly powerful.',
    occasion: 'No occasion required.',
    rules: 'Wine without the rules.',
    bright:
      'Bright, lively, and made to be opened without occasion. Crisp bubbles, ' +
      'easy flavours, and just enough boldness to keep the night going.',
  },
  /** The four brand values, verbatim from the guidelines. */
  values: [
    { name: 'Freedom', sub: '(Libre)', line: 'Choice without compromise. Inclusive, accessible and open to all.' },
    { name: 'Joyful Expression', sub: null, line: 'Playful, vibrant, and full of life. Never serious, never stiff.' },
    { name: 'Social Connection', sub: null, line: 'Designed for shared moments.' },
    { name: 'Effortless Enjoyment', sub: null, line: 'No intimidation. No rules. Just good wine, made easy.' },
  ],
  /** Words that define the LIBRE world, used across communication. */
  nouns: [
    'Celebration', 'Freedom', 'Flavour', 'Rhythm', 'Vibe', 'Togetherness',
    'Expression', 'Energy', 'Colour', 'Moment', 'Joy', 'Culture',
  ],
} as const;
