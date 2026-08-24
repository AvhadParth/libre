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
pairings, photography, social handles, contact details, legal copy, and the
Gold Pearl back label (its MRP and panel are carried over from the rest of the
range and marked `SAMPLE`).

Everything still outstanding renders through a visible marker so it can never
quietly graduate into approved copy:

| Marker | Meaning | Component |
|---|---|---|
| Dashed chip — *"Awaiting client supply"* | No value exists yet | `Pending` |
| Grey `SAMPLE` pill next to a value | A stand-in number, shown so the design and commerce flows can be reviewed | `SampleTag` |
| `Shot brief` caption on an image | No photography supplied; the caption is the art direction for the shoot | `Frame` |

**Sample marking is per product, per field.** Each `Product` in
`src/lib/products.ts` carries an `estimates` array naming the fields that are
still stand-ins; only those render a `SAMPLE` pill. Today only Gold Pearl has
any. `SHOW_SAMPLE_VALUES` in `src/lib/content-config.ts` still gates the
remaining global stand-ins (the story wall, flavour meters).

The brand-voice copy (personality lines, section headings, the "rules crossed
out" list) **is** authored — it is tone, not a claim, and is offered for
approval like any other creative copy.

---

## Files this repo does not carry

Two things are deliberately excluded, so a fresh clone will not be a byte-for-byte
copy of the running site.

**`public/fonts/*.woff2` — the brand typefaces.** Chantal Medium and Avenir Light
are both licensed "Preview & Print" only, and no web licence has been obtained
yet, so the binaries are not published here. The site still runs without them:
headlines fall back to Permanent Marker and body text to Avenir/Mulish — the
right register, the wrong detail. See [`public/fonts/README.md`](public/fonts/README.md)
and [FONTS.md](FONTS.md).

**`brand-source/` — the client's source material.** The 2026 brand guidelines
PDF, packaging artwork, label scans and the raw 3D bottle masters. Unreleased
commercial material, and the origin of the extracted fonts.

Everything the live site actually serves **is** committed — the traced logo and
icons, the cut-out label artwork, the optimised bottle models and the
photography. The rule is simple: if it is already public on the website, it is
in the repo; if it is internal source or a licensed third-party binary, it is
not.

To restore a complete working copy, drop the licensed fonts into `public/fonts/`
and, if you need to re-derive assets, the `brand-source/` folder alongside.

---

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

### 3. Photography
Every image slot is a `<Frame>`. Passing `src` and `alt` replaces the
placeholder composition with the real photograph — no other change:

```tsx
<Frame brief="…" src="/photography/dinner-01.jpg" alt="…" />
```

The `brief` on each frame is a genuine shot direction. The full shot list is
simply every `brief` string in the codebase:
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
Cava Cream → Tempranillo Rouge → Cream → Sol Yellow
           → Verdejo Vine → (vibe-driven) → Azul → Airén Mist → Cream → Azul
```

Every pairing in the palette scores **≥ 9:1** contrast.

### The signature sequence
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
  homepage's first load is ~174 kB, and the typography paints before the 3D
  arrives.
- The canvas renders **zero frames** while scrolled off screen.
- A device tier (`useTier`) scales lathe segments, pixel ratio, particle counts
  and material cost; low-end devices drop transmission entirely.
- Geometry is all revolved 2D profiles — a few thousand triangles for the whole
  scene. Textures are generated at runtime, so there are no 3D asset downloads.
- No WebGL, or reduced motion, serves a static SVG still life instead.

---

## Structure

```
src/
  app/                  routes: / /world /wine /wine/[slug] /stories /cart /legal/[doc]
  components/           Nav, HeroPour, BrandStory, ProductShowcase, VibeSelector,
                        StoryGallery, Scrapbook, ChaosButton, FinalCTA, CartView…
  components/brand/     Logo, Marks (grape · glass · scribble · dots), Confetti
  three/                BottleScene, Bottle, WineGlass, PourStream, Studio,
                        profiles (lathe silhouettes), sequence (the choreography)
  lib/                  products, stories, cart, palette, motion, content-config
```

`src/three/sequence.ts` is worth reading first — the entire POP → POUR
choreography is one timing map, and every object derives its own behaviour from
it, so nothing in the scene needs to know about anything else.
