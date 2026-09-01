import { SHOW_SAMPLE_VALUES } from './content-config';

export type ThemeName =
  | 'cream' | 'rouge' | 'vine' | 'mist' | 'sol' | 'azul'
  | 'coral' | 'jade' | 'sky' | 'butter' | 'rose';

export type FlavourAxis = { label: string; value: number | null };
export type Pairing = { label: string; note: string | null };
export type Fact = { label: string; value: string | null };

export type Product = {
  slug: string;
  /** Product name exactly as it appears on the label. */
  name: string;
  /** The style line under the name — "Red 0%", "Sparkling Rosé". */
  variant: string | null;
  /** Brand-voice personality line. Tone, not a product claim — safe to author. */
  personality: string;
  /** Short editorial description. Contains no flavour, health or origin claims. */
  blurb: string;
  theme: ThemeName;
  /**
   * The ground the product's own hero stands on.
   *
   * Deliberately NOT `theme`. A bottle photographed on its own brand colour
   * disappears into it — the rosé on Airén Mist and the gold on Sol were pink
   * on pink and gold on gold. These were picked by measuring each bottle's body
   * and foil against every ground in the palette and taking the pairing whose
   * weaker separation was strongest, so both the glass and the cap read.
   */
  heroGround: ThemeName;
  altTheme: ThemeName;
  /** Supplied label artwork — front badge and the regulatory back panel. */
  label: { front: string; back: string | null };
  /** Commerce — from the supplied MRP panel. */
  price: number | null;
  currency: string;
  volume: string | null;
  inStock: boolean;
  /** Product facts — transcribed from the supplied labels. Never author these. */
  ingredients: string[] | null;
  nutrition: Fact[] | null;
  details: Fact[] | null;
  /** Flavour axes: labels proposed for layout, values AWAITING CLIENT APPROVAL. */
  flavour: FlavourAxis[];
  /** Food pairings — factual, AWAITING CLIENT SUPPLY. */
  pairings: Pairing[];
  /** Moments are brand expression, deliberately kept separate from food pairings. */
  moments: string[];
  /**
   * Fields on THIS product that are still stand-ins rather than supplied fact.
   * Anything listed here renders with a visible SAMPLE marker. Everything else
   * is transcribed from the labels in `brand-source/` and is shown as truth.
   */
  estimates: readonly ProductField[];
};

/** Fields that can carry a SAMPLE marker. */
export type ProductField = 'price' | 'volume' | 'nutrition' | 'ingredients';

/** Sample numbers for design review only. Rendered with a visible SAMPLE marker. */
const sample = <T,>(value: T): T | null => (SHOW_SAMPLE_VALUES ? value : null);

const AXES = ['Fruit', 'Freshness', 'Body', 'Sweetness', 'Acidity'];

/**
 * Flavour values are NOT on the supplied labels and are not ours to invent, so
 * every axis stays null and the meters render their awaiting-content state.
 * Supply an array here the moment the tasting notes are approved.
 */
const axesPending = (): FlavourAxis[] => AXES.map((label) => ({ label, value: null }));

/** Every SKU is bottled by the same house, in the same place. */
export const ORIGIN = {
  house: 'Bodegas López Morenas',
  town: 'Fuente del Maestre',
  province: 'Badajoz',
  region: 'Extremadura',
  subRegion: 'Tierra de Barros',
  appellation: 'Ribera del Guadiana DO',
  country: 'Spain',
  since: 1943,
} as const;

/** Shared across the range — identical on every supplied back label. */
const SERVE: Fact[] = [
  { label: 'Format', value: '750 ml' },
  { label: 'Serve', value: 'Chilled' },
  { label: 'After opening', value: 'Use within 4 days' },
  { label: 'Origin', value: 'Product of Spain' },
];

const STILL_NUTRITION: Fact[] = [
  { label: 'Energy', value: '25.7 kcal' },
  { label: 'Protein', value: '0.0 g' },
  { label: 'Carbohydrates', value: '5.9 g' },
  { label: 'Total sugars', value: '5.9 g' },
  { label: 'Added sugars', value: '0.0 g' },
  { label: 'Total fat', value: '0.0 g' },
  { label: 'Sodium', value: '0.0 mg' },
];

const SPARKLING_NUTRITION: Fact[] = [
  { label: 'Energy', value: '48.8 kcal' },
  { label: 'Protein', value: '0.0 g' },
  { label: 'Carbohydrates', value: '9.0 g' },
  { label: 'Total sugars', value: '9.0 g' },
  { label: 'Added sugars', value: '0.0 g' },
  { label: 'Total fat', value: '0.0 g' },
  { label: 'Sodium', value: '0.0 mg' },
];

const STILL_INGREDIENTS = [
  'Dealcoholized fermented grape juice',
  'Stabilizer (INS414)',
  'Preservatives (INS220, INS202, INS242)',
  'Acidity regulator (INS270)',
  'Contains sulphites',
];

const SPARKLING_INGREDIENTS = [
  'Grape juice (50%)',
  'Water',
  'Carbon dioxide (INS290)',
  'Antioxidant (INS300)',
  'Acidity regulators (INS330, INS270)',
  'Preservatives (INS202, INS220)',
  'Contains sulphites',
];

/** Nutrition tables are per 100 ml on every supplied label. */
export const NUTRITION_BASIS = 'Typical values per 100 ml';

export const products: Product[] = [
  {
    slug: 'merlot-red',
    name: 'Merlot',
    variant: 'Red 0%',
    personality: 'The one that starts things.',
    blurb:
      'Dealcoholized red, made for the first pour of the evening — when nobody ' +
      'has decided what the night is yet.',
    theme: 'rouge',
    altTheme: 'sol',
    /* dark glass and an orange foil both read on cream — 4.1:1 at the weaker of the two */
    heroGround: 'cream',
    label: {
      front: '/brand/labels/merlot-front.jpeg',
      back: '/brand/labels/merlot-back.jpeg',
    },
    price: 1299,
    currency: 'INR',
    volume: '750 ml',
    inStock: true,
    ingredients: STILL_INGREDIENTS,
    nutrition: STILL_NUTRITION,
    details: [
      ...SERVE,
      { label: 'Style', value: 'Dealcoholized red wine' },
      { label: 'Alcohol', value: 'Less than 0.5% v/v' },
    ],
    flavour: axesPending(),
    pairings: [
      { label: 'Awaiting pairing 01', note: null },
      { label: 'Awaiting pairing 02', note: null },
      { label: 'Awaiting pairing 03', note: null },
    ],
    moments: ['The first hour', 'Kitchen conversations', 'Getting ready'],
    estimates: [],
  },
  {
    slug: 'sauvignon-blanc-white',
    name: 'Sauvignon Blanc',
    variant: 'White 0%',
    personality: 'The one with no reason at all.',
    blurb:
      'Dealcoholized white. No occasion, no ritual, no explanation required — ' +
      'which is rather the point.',
    theme: 'vine',
    altTheme: 'butter',
    /* olive glass on warm butter — 3.4:1, and distinct from Merlot's cream */
    heroGround: 'butter',
    label: {
      front: '/brand/labels/sauvignon-front.jpeg',
      back: '/brand/labels/sauvignon-back.jpeg',
    },
    price: 1299,
    currency: 'INR',
    volume: '750 ml',
    inStock: true,
    ingredients: STILL_INGREDIENTS,
    nutrition: STILL_NUTRITION,
    details: [
      ...SERVE,
      { label: 'Style', value: 'Dealcoholized white wine' },
      { label: 'Alcohol', value: 'Less than 0.5% v/v' },
    ],
    flavour: axesPending(),
    pairings: [
      { label: 'Awaiting pairing 01', note: null },
      { label: 'Awaiting pairing 02', note: null },
      { label: 'Awaiting pairing 03', note: null },
    ],
    moments: ['No plans', 'Balcony hours', 'Whenever, honestly'],
    estimates: [],
  },
  {
    slug: 'sparkling-rose',
    name: 'Sparkling Rosé',
    variant: 'Alcohol Free',
    personality: 'The one that turns it into a night.',
    blurb:
      'Bright, lively, and made to be opened without occasion. Crisp bubbles ' +
      'and easy flavours, just bold enough to keep the night going.',
    theme: 'mist',
    altTheme: 'rouge',
    /* pale pink on deep Tempranillo — 5.7:1, the strongest pairing in the range */
    heroGround: 'rouge',
    label: {
      front: '/brand/labels/sparkling-rose-badge.jpeg',
      back: '/brand/labels/sparkling-rose-back.jpeg',
    },
    price: 1299,
    currency: 'INR',
    volume: '750 ml',
    inStock: true,
    ingredients: SPARKLING_INGREDIENTS,
    nutrition: SPARKLING_NUTRITION,
    details: [
      ...SERVE,
      { label: 'Style', value: 'Sparkling rosé grape beverage' },
      { label: 'Alcohol', value: '0%' },
    ],
    flavour: axesPending(),
    pairings: [
      { label: 'Awaiting pairing 01', note: null },
      { label: 'Awaiting pairing 02', note: null },
      { label: 'Awaiting pairing 03', note: null },
    ],
    moments: ['Long tables', 'The good glasses', 'Nothing in the diary'],
    estimates: [],
  },
  {
    slug: 'sparkling-white',
    name: 'Sparkling White',
    variant: 'Alcohol Free',
    personality: 'The one that stays for dinner.',
    blurb:
      'The long one. Poured somewhere between the second course and the third ' +
      'story nobody asked for.',
    theme: 'sol',
    altTheme: 'vine',
    /* green glass and gold foil: no ground flatters both, and the foil wins at 6.6:1 on Azul */
    heroGround: 'azul',
    label: {
      front: '/brand/labels/sparkling-white-badge.jpeg',
      back: '/brand/labels/sparkling-white-back.jpeg',
    },
    price: 1299,
    currency: 'INR',
    volume: '750 ml',
    inStock: true,
    ingredients: SPARKLING_INGREDIENTS,
    nutrition: SPARKLING_NUTRITION,
    details: [
      ...SERVE,
      { label: 'Style', value: 'Sparkling white grape beverage' },
      { label: 'Alcohol', value: '0%' },
    ],
    flavour: axesPending(),
    pairings: [
      { label: 'Awaiting pairing 01', note: null },
      { label: 'Awaiting pairing 02', note: null },
      { label: 'Awaiting pairing 03', note: null },
    ],
    moments: ['Sunday cooking', 'Long tables', 'The good plates'],
    estimates: [],
  },
  {
    slug: 'gold-pearl',
    name: 'Gold Pearl',
    variant: 'Alcohol Free',
    personality: 'Shake for liquid gold.',
    blurb:
      'The one that arrives with its own instruction. Shake it, pour it, and ' +
      'let the room work out what just happened.',
    theme: 'azul',
    altTheme: 'sol',
    /* gold on deep Verdejo — 4.2:1, and it keeps Azul free for Sparkling White */
    heroGround: 'vine',
    label: { front: '/brand/labels/gold-pearl-badge.jpeg', back: null },
    price: 1299,
    currency: 'INR',
    volume: '750 ml',
    inStock: true,
    ingredients: SPARKLING_INGREDIENTS,
    nutrition: SPARKLING_NUTRITION,
    details: [
      ...SERVE,
      { label: 'Style', value: 'Grape beverage' },
      { label: 'Alcohol', value: '0%' },
    ],
    flavour: axesPending(),
    pairings: [
      { label: 'Awaiting pairing 01', note: null },
      { label: 'Awaiting pairing 02', note: null },
      { label: 'Awaiting pairing 03', note: null },
    ],
    moments: ['Midnight', 'When someone says "one more"', 'The photo nobody planned'],
    /*
     * Confirmed by the client as a full product, not a sample. Its nutrition
     * and ingredients panel is still the sparkling range's, carried over
     * because no Gold Pearl back label was supplied — worth checking against
     * the real one, but it is no longer flagged on the page.
     */
    estimates: [],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (price: number | null, currency = 'INR') =>
  price === null
    ? '—'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
      }).format(price);
