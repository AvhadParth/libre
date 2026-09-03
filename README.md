# LIBRE

**Wine. Without the rules.**

A digital brand experience for LIBRE — non-alcoholic wine for a generation that
never needed an occasion.

Next.js 15 · React 19 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

---

## ⚠️ Read this first: nothing here invents a product fact

Product facts now come from the supplied artwork in `brand-source/`. Names,
prices, formats, ingredients, nutrition and origin are **transcribed from the
labels** — not authored. What is still missing is still marked as missing.

**Supplied and now live:** the five SKUs, ₹1,299 MRP, 750 ml, ingredient lists,
per-100 ml nutrition, alcohol declarations, and the Extremadura provenance.

**Still awaiting client supply:** tasting notes / flavour axis values, food
pairings, social handles, contact details and legal copy.

**Gold Pearl** is confirmed by the client as a full product — its price is no
longer marked `SAMPLE`. Its ingredients and nutrition panel is still the
sparkling range's, carried over because no Gold Pearl back label was supplied,
and is worth checking against the real label.

**Photography has landed** and is live across the site. The two sections that
were built entirely on unapproved data — the flavour axes and the food pairings
— are no longer rendered rather than shown empty; see *Dormant components*.

Everything still outstanding renders through a visible marker so it can never
quietly graduate into approved copy:

| Marker | Meaning | Component |
|---|---|---|
| Dashed chip — *"Awaiting client supply"* | No value exists yet | `Pending` |
| Grey `SAMPLE` pill next to a value | A stand-in number, shown so the design and commerce flows can be reviewed | `SampleTag` |
| `Shot brief` caption on an image | No photography supplied; the caption is the art direction for the shoot | `Frame` |

**Sample marking is per product, per field.** Each `Product` in
`src/lib/products.ts` carries an `estimates` array naming the fields that are
still stand-ins; only those render a `SAMPLE` pill. **No product carries one
today.** `SHOW_SAMPLE_VALUES` in `src/lib/content-config.ts` still gates the
remaining global stand-ins.

The brand-voice copy (personality lines, section headings, the "rules crossed
out" list) **is** authored — it is tone, not a claim, and is offered for
approval like any other creative copy.

---

## Files this repo does not carry

**`brand-source/` — the client's source material.** The 2026 brand guidelines
PDF, packaging artwork, label scans and the raw 3D bottle masters. Unreleased
commercial material, and the origin of both the traced brand assets and the
reconstructed fonts. Everything derived from it that the site actually serves —
the logo and icons, the cut-out label artwork, the optimised bottle models — is
committed under `public/`.

The brand webfonts **are** committed, under `public/fonts/`. That is only
acceptable because **this repository is private**: both faces are licensed
"Preview & Print" only. If it is ever made public, take the two `.woff2` files
out first. Serving them from the deployed site is a separate question and still
needs a web licence — see [FONTS.md](FONTS.md).

---

## Derived assets

Two things in `src/lib/` are generated from supplied artwork rather than
hand-authored, and both note their provenance in the file:

- **`spain-map.ts`** — the guidelines' region sheet is a flat 828px JPEG with
  its caption baked in, which cannot draw itself on a scroll or magnify without
  going soft. It is traced into two vector paths (the landmass, and Extremadura
  alone) so the origin section can stroke the coastline on and then zoom into
  the region sharply. The trace had to seal the slit the pin's leader line cut
  through the coast, and filter out the caption's antialiased edges, which fall
  in the same grey band as the map.
- **`public/photography/*/**.webp`** — every image the site serves.

## Handover checklist

Everything below is a real integration point, already wired and waiting.

### 1. Fonts — Chantal Medium + Avenir Light  ← LIVE, but check the licence
Both brand faces are self-hosted from `public/fonts/` and are what the site
renders in today. Chantal Medium carries headlines and the logotype; Avenir
Light carries body text, captions and product information — exactly the split
the guidelines specify.

Neither was supplied as a font file, so both were reconstructed: Avenir Light
from the system font collection (complete), Chantal from the subsets embedded
in the guidelines PDF, plus `J` and `W` traced out of `brand-source/font.png`
and five glyphs derived from Chantal's own letterforms.

**⚠️ A webfont licence is still needed before launch** — both sources permit
"Preview & Print" embedding only, which does not cover serving a webfont.
Chantal from Device Fonts / Rian Hughes, Avenir LT Pro from Monotype or Adobe
Fonts. Dropping the licensed `.woff2` files over the two in `public/fonts/`
replaces the reconstruction entirely; nothing else changes.

Full provenance, per glyph, is in [FONTS.md](FONTS.md).

### 2. The logo and icons — DONE, traced from the guidelines
The hand-drawn LIBRE wordmark and the brand icons are the **real artwork**, not
redraws. They were traced out of the vector-quality images embedded in
`brand-source/OLÉ LIBRE BRAND GUIDELINES 2026.pdf` and live as path data in
`src/components/brand/paths.ts`, with standalone SVGs in `public/brand/`.

| Asset | Component | File |
|---|---|---|
| LIBRE wordmark | `<Logo />` | `public/brand/libre.svg` |
| The grape | `<Grape />`, `<Logo variant="mark" />` | `public/brand/grape.svg` |
| The wineglass | `<Glass level={0–1} />` | `public/brand/wineglass.svg` |
| The scribbles | `<ScribbleMark />` | `public/brand/scribble.svg` |
| The confetti | `<ConfettiMark />` | `public/brand/confetti.svg` |
| The polka dots | `<Dots />` | generated — a pattern, not a drawing |

**Note on Olé!** The 2026 guidelines were issued under the earlier *Olé! LIBRE*
identity, in which "olé!" was the primary logo and LIBRE the sub-mark. Olé! has
since been dropped from the brand. LIBRE now stands alone as the logo, and the
olé! lockups have been removed from the codebase entirely. The guidelines PDF
in `brand-source/` still shows them — treat it as historical on that point.

To re-trace after an artwork update: `pdfimages -png` the page, invert the
smask, `potrace -s`, then normalise into `paths.ts`. Do not hand-edit the `d`
strings.

Clear space is enforced by the `--clear-space` token; the mark is never skewed,
filtered, recoloured beyond `currentColor`, or animated internally.

### 3. Photography — SUPPLIED, and live
Product and lifestyle photography is in `public/photography/`. The site never
serves the source PNGs; every use is a WebP derivative generated from them:

| Set | Used by | Size |
|---|---|---|
| `cards/{slug}-studio.webp` · `cards/{slug}-cutout.webp` | shop cards, product heroes, "or maybe one of these" | 533 KB for all ten, from 12.2 MB of PNG |
| `shelf/{slug}.webp` | the range shelf, the cart drawer and `/cart` line items | ~65 KB each |
| `marquee/{slug}.webp` | the brand band | ~65 KB each |
| `vineyard.webp` | the origin section's ground | 88 KB, from 2.3 MB |

The source PNGs (~36 MB) are still committed and are **not** referenced by any
component. They are worth pruning before launch.

**Remaining placeholders.** `<Frame>` still renders shot briefs on `/world`,
`/stories` and inside `Scrapbook`, which those two pages still use. Passing
`src` and `alt` replaces the composition with the real photograph, no other
change. The outstanding shot list is every `brief` string left:
`grep -rn 'brief=' src/`

### 4. The 3D bottle label — DONE, supplied artwork
`src/three/labelTexture.ts` wraps the **real label artwork** onto the cylinder,
placed twice (front and back), never recoloured or cropped.

The source JPEGs are in `public/brand/labels/`. The versions actually used are
the cut-outs in `public/brand/labels/cut/` — the white surround has been flood-
filled to transparency so the glass reads between the two labels, as on a real
bottle. Regenerate them if the artwork changes; a SKU with no `labelArt` falls
back to a clearly-marked placeholder wrap.

Glass, foil and label colourways per SKU are in `src/lib/palette.ts`, read off
the supplied bottle mockups.

### 5. Product catalogue — DONE for label facts
`src/lib/products.ts` holds the five real SKUs:

| Slug | Name | Style | Alcohol |
|---|---|---|---|
| `merlot-red` | Merlot | Red 0% — dealcoholized red wine | < 0.5% v/v |
| `sauvignon-blanc-white` | Sauvignon Blanc | White 0% — dealcoholized white wine | < 0.5% v/v |
| `sparkling-rose` | Sparkling Rosé | sparkling rosé grape beverage | 0% |
| `sparkling-white` | Sparkling White | sparkling white grape beverage | 0% |
| `gold-pearl` | Gold Pearl | grape beverage — "shake for liquid gold" | 0% |

All ₹1,299 MRP, 750 ml, `Product of Spain`. Ingredients and per-100 ml nutrition
are transcribed from the back labels. `ORIGIN` in the same file carries the
Extremadura provenance, rendered on `/world`.

**Still to supply:** tasting notes (every `flavour` axis is `null`, so the
meters render their awaiting state) and food pairings. Gold Pearl's back label
was not supplied — its price and panel are inherited and flagged via
`estimates`.

### 6. Newsletter
`src/app/api/newsletter/route.ts` validates and forwards. Until configured it
answers **501** and the form says so rather than faking a confirmation.

```bash
NEWSLETTER_ENDPOINT=https://your-provider/subscribe
NEWSLETTER_TOKEN=…            # optional bearer token
```

### 7. Commerce
**The shop flow is closed.** `Shop` in the nav goes to `/wine#shop` — the
buyable cards on the range page — and from there: card → product page → add to
cart → cart. Every step is live. (`Shop` used to point at `/cart`, so it took
you to your own empty basket rather than to the range; the cart has its own
control at the end of the bar.)

The cart is fully live — line items, quantities, persistence, subtotals — and
stops exactly at checkout. Point the Checkout button in
`src/components/CartView.tsx` at your provider (Shopify, Stripe, Commerce
Layer…); `useCart()` already exposes everything a checkout session needs.
Taxes, shipping rates, currency and payment methods are unconfigured.

### 8. Sound
`src/lib/sound.ts`. The cue points are already wired — the cork leaving the
neck, the stream for exactly as long as it is visible, the glass coming to rest,
add-to-cart, the chaos button, the vibe chips.

Nothing plays and no control renders until **both** are true: audio exists, and
the visitor turned it on. Sound never autoplays, defaults to off, persists the
visitor's choice, and is never required to understand anything.

1. Drop the cue files into `public/sound/` (names are in `CUES`)
2. Set `SOUND_AVAILABLE = true`

The mute control then appears bottom-left.

### 9. Legal
`/legal/privacy`, `/legal/terms` and `/legal/accessibility` are routed and
structured but intentionally empty. Placeholder legalese would be worse than
none. Social handles and contact details in the footer are also pending.

---

## The idea

**POP → POUR → FEEL → SHARE → CELEBRATE.**

The interaction language is physical, not decorative. Things roll, pour, settle
and collide — and each animation is doing a job.

- **~70% elegant editorial motion** — parallax, typographic transitions, scroll-linked colour
- **~20% playful interaction** — grape cursor, drawing scribbles, confetti, elastic buttons
- **~10% genuine wow** — the bottle, the pop, the pour, and the wine becoming the next section

### The colour journey
Sections paint their own ground rather than cross-fading a shared one, so
contrast is guaranteed at every scroll position — a background and foreground
cross-fading past each other momentarily meet in the middle and become
unreadable. The travel between colours is designed instead: the liquid wipe, the
dot fields, the curved leading edge of a page transition.

```
Sol Yellow → Airén Mist → Verdejo Vine → Tempranillo Rouge   (the line-up)
           → Cream → Sol Yellow → Cream → Cream (the shop)
           → Azul (the origin) → Cream
```

Every pairing in the palette scores **≥ 9:1** contrast.

**Product heroes do not use the product's own colour.** A bottle photographed on
its own brand ground disappears into it — the rosé was pink on pink, the gold
was gold on gold. Each product carries a separate `heroGround`, chosen by
measuring that bottle's **body and foil cap** against all eleven grounds and
taking the pairing whose *weaker* separation was strongest:

| | ground | weaker separation |
|---|---|---|
| Merlot | Cava Cream | 4.1:1 |
| Sauvignon Blanc | Butter | 3.4:1 |
| Sparkling Rosé | Tempranillo Rouge | 5.7:1 |
| Sparkling White | Azul | foil 6.6:1 — no ground flatters green glass *and* gold |
| Gold Pearl | Verdejo Vine | 4.2:1 |

### The homepage hero — what actually renders
`src/components/HeroLineup.tsx`. Four bottles on one line; scrolling rotates the
current bottle and hands over to the next, and the ground interpolates between
their brand colours in **OKLab** so the blend never passes through mud. Each
bottle's label angle is measured, not eyeballed, so every one faces front when
it settles.

### The pour sequence — built, not currently mounted
`src/components/HeroPour.tsx` is one 520vh scroll track with a sticky stage. A
single scrubbed GSAP timeline drives both the typography and `seq.progress`, and
the 3D reads that value in `useFrame` — so the words and the bottle are never a
frame out of step, and React never re-renders during the sequence.

Details worth keeping:
- The wine inside the bottle is clipped by a plane in **world** space, so its
  surface stays level while the bottle tips. That single detail is what makes it
  read as liquid rather than as an animation.
- The pour tilts to **100°** — past horizontal. Anything under 90° is a bottle
  leaning, not a bottle pouring.
- The glass fills for real: the body of wine is clipped at the level, and a
  separate surface disc is resized every frame to the exact inner radius of the
  bowl at that height, which gives it a meniscus.
- The glass is modelled **single-walled**. Two transparent walls between camera
  and wine blend against each other in vertex order and pinstripe the bowl; a
  rim torus restores the bright edge the missing thickness would have given.
- Studio lighting is built from `Lightformer` geometry, so the scene lights
  itself in a few kilobytes with **no HDRI download** and works offline.

It is kept because it is the strongest thing in the repo, but the homepage
currently opens on the line-up instead.

---

## Accessibility

The experiment never costs anyone the content.

- **`prefers-reduced-motion`** is honoured everywhere and at three levels: Lenis
  is not instantiated, the scroll sequences do not run, and the hero falls back
  to a composed static layout telling the same story. Confetti never fires.
- **No-JS** never hides content. The reveal system sets its hidden "from" state
  from GSAP in a layout effect — there is no CSS rule that hides anything.
- Semantic landmarks, a skip link, real heading hierarchy, `role="meter"` on the
  flavour axes with `aria-valuetext` for unsupplied values, live regions on cart
  quantities and form status.
- Focus is always visible; the menu and cart drawer trap Escape and use `inert`.
- The custom cursor is **desktop-and-motion-only** and every affordance it
  conveys is duplicated in visible UI.
- Horizontal storytelling becomes a native snapping scroller on touch.

## Performance

- Three.js, drei and the whole scene are a **dynamically imported chunk** — the
  typography paints before the 3D arrives.
- **The 3D is homepage-only.** Product pages moved to photography, which took
  `/wine/[slug]` from 6.99 kB to 3.73 kB and dropped the three.js chunk from
  five routes.
- Every photograph is served as a WebP derivative, never the source PNG — see
  *Photography*.
- The canvas renders **zero frames** while scrolled off screen.
- A device tier (`useTier`) scales lathe segments, pixel ratio, particle counts
  and material cost; low-end devices drop transmission entirely.
- Geometry is all revolved 2D profiles — a few thousand triangles for the whole
  scene. Textures are generated at runtime, so there are no 3D asset downloads.
- No WebGL, or reduced motion, serves a static SVG still life instead.

---

## What each page is made of

**`/` — the homepage**, nine sections:

| Section | Component | What it does |
|---|---|---|
| The line-up | `HeroLineup` | four bottles, scroll-driven handover, OKLab ground |
| Not serious | `BrandStory` | the accusation rolls, the sheet is pulled off |
| Meet LIBRE | `MeetLibre` | four values, photographs resolving greyscale → colour |
| What are you pouring? | `ProductShowcase` | the range on one shelf, one readout |
| When? | `WhenSection` | answers land until the question is buried |
| Our stories | `StoryGallery` | a film strip travelling sideways |
| Go on, then. | `VibeSelector` | **the shop** — five cards, studio shot dissolving to cut-out on hover, real add-to-cart |
| Where it comes from | `OriginStory` | Spain draws itself, magnifies to Fuente del Maestre |
| Ready when you are | `FinalCTA` | **reads the cart** — line items and checkout, or a way back to the shop |

**`/wine`** — editorial opening, then `ProductShowcase` + the shop cards +
`FinalCTA`. This is what `Shop` in the nav points at.

**`/wine/[slug]`** — `ProductHero` (buy panel, one screen), marquee,
`WhatsInside`, and a short sideways row. Deliberately four sections, ~4,500px.

**`/world`, `/stories`** — still carry `Scrapbook` and its shot briefs.

```
src/
  app/                  routes: / /world /wine /wine/[slug] /stories /cart /legal/[doc]
  components/           Nav, HeroLineup, BrandStory, MeetLibre, ProductShowcase,
                        WhenSection, StoryGallery, VibeSelector, OriginStory,
                        FinalCTA, ProductHero, WhatsInside, CartView…
  components/brand/     Logo, Marks (grape · glass · scribble · dots), Confetti
  three/                BottleScene, Bottle, WineGlass, PourStream, Studio,
                        profiles (lathe silhouettes), sequence (the choreography)
  lib/                  products, stories, cart, colour (OKLab), spain-map,
                        palette, motion, content-config
```

## One rule worth keeping

**Do not use ScrollTrigger's `pin` in this app — use CSS `position: sticky`.**

A pin wraps its element in a `.pin-spacer` div, which re-parents a node React
rendered. On navigating away React then tries to remove that node from a parent
it no longer has, throws *"Failed to execute 'removeChild' on 'Node'"*, and the
route dies — every link out of the page needs a manual reload to recover. It
only shows up on pages that carry a pinned section, which is what made it look
like a link problem rather than a scroll one.

`StoryGallery` and `OriginStory` both hold their stage with sticky and carry the
scroll distance as their own height. `StoryGallery` writes that height from JS
on `refreshInit`, because it depends on how wide the strip actually is.

## Dormant components

Built, tested, and **not currently rendered**. None are deleted; each is one
line away from returning.

| Component | Why it is not mounted |
|---|---|
| `FlavourProfile` | every axis value is `null` — it rendered five empty meters reading *VALUE TBC* |
| `PairingSection` | its three pairings are *"Awaiting pairing 01/02/03"* |
| `ProductBottle` | product heroes use photography; only four of five products have a `.glb`, so Gold Pearl's page had no bottle at all |
| `ProductCard` | the product page's sideways row is a compact photographic row now |
| `HeroPour` | the homepage opens on `HeroLineup` |

`FlavourProfile` and `PairingSection` return the moment their data is approved.

`src/three/sequence.ts` is worth reading first — the entire POP → POUR
choreography is one timing map, and every object derives its own behaviour from
it, so nothing in the scene needs to know about anything else.
