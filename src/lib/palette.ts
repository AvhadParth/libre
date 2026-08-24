/**
 * Bottle colourways for the 3D scene.
 *
 * These are read off the supplied packaging artwork in `brand-source/` — the
 * bottle mockups (`sparkling-*-bottle.jpeg`) and the front labels. Glass, foil
 * and label artwork are all real; never recolour packaging to match a page.
 */
export type BottlePalette = {
  glass: string;
  wine: string;
  foil: string;
  labelGround: string;
  labelInk: string;
  labelAccent: string;
  /**
   * Supplied front-label artwork, wrapped onto the cylinder. These are the
   * cut-out PNGs in `labels/cut/` — the white surround has been removed so
   * the glass shows between the front and back label, as on a real bottle.
   */
  labelArt: string | null;
};

const DEFAULT: BottlePalette = {
  glass: '#0d3a2f',
  wine: '#5c1a30',
  foil: '#C6762F',
  labelGround: '#FFF8E8',
  labelInk: '#451326',
  labelAccent: '#F9BDC9',
  labelArt: null,
};

const PALETTES: Record<string, BottlePalette> = {
  /* Dealcoholized red — dark glass, copper capsule, cream label. */
  'merlot-red': {
    ...DEFAULT,
    glass: '#2E1119',
    wine: '#4a1226',
    foil: '#C6762F',
    labelAccent: '#FFC33C',
    labelArt: '/brand/labels/cut/merlot-front.png',
  },
  /* Dealcoholized white — green glass, copper capsule. */
  'sauvignon-blanc-white': {
    ...DEFAULT,
    glass: '#2C4033',
    wine: '#C9B87A',
    foil: '#C6762F',
    labelAccent: '#003B2F',
    labelArt: '/brand/labels/cut/sauvignon-front.png',
  },
  /* Sparkling rosé — pink flint glass, pink capsule, oval badge. */
  'sparkling-rose': {
    ...DEFAULT,
    glass: '#E9A7AE',
    wine: '#E58CA0',
    foil: '#E7A9B4',
    labelGround: '#FFF0D9',
    labelAccent: '#F9BDC9',
    labelArt: '/brand/labels/cut/sparkling-rose-badge.png',
  },
  /* Sparkling white — green glass, gold capsule, sol-yellow badge. */
  'sparkling-white': {
    ...DEFAULT,
    glass: '#2C4033',
    wine: '#D8C98A',
    foil: '#D8B25A',
    labelGround: '#FFF0D9',
    labelAccent: '#FFC33C',
    labelArt: '/brand/labels/cut/sparkling-white-badge.png',
  },
  /* Gold Pearl — deep navy glass, gold capsule, azul badge. */
  'gold-pearl': {
    ...DEFAULT,
    glass: '#1A2338',
    wine: '#D8B25A',
    foil: '#D8B25A',
    labelGround: '#FFF0D9',
    labelAccent: '#002752',
    labelArt: '/brand/labels/cut/gold-pearl-badge.png',
  },
};

export const paletteFor = (slug: string): BottlePalette => PALETTES[slug] ?? DEFAULT;
