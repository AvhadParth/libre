# Fonts

Per the brand guidelines:

- **Chantal Medium** — headlines and the logotype
- **Avenir Light** — body text, captions and product information

Both are self-hosted from `public/fonts/` and are live on the site. Every type
token in `src/app/globals.css` names them, and nothing else carries display or
body type.

| File | Face | Size |
|---|---|---|
| `public/fonts/Chantal-Medium.woff2` | Chantal Medium | 11.7 KB |
| `public/fonts/AvenirLTPro-Light.woff2` | Avenir Light | 33.6 KB |

---

## ⚠️ Licensing — resolve before launch

Neither face was supplied as a font file. Both were reconstructed from assets
already in this repo and on the build machine. **That does not grant a licence
to serve them.**

| Face | Copyright | Embedding permission in the source |
|---|---|---|
| Chantal | © 1993 Rian Hughes / Device Fonts | `fsType 0x0004` — Preview & Print |
| Avenir | © Monotype GmbH | `fsType 0x0004` — Preview & Print |

"Preview & Print" covers embedding in a document for viewing and printing. A
webfont serves the binary to every visitor, which is redistribution and goes
beyond that permission.

**Before this site goes public, buy a webfont licence:**

- **Chantal** — Device Fonts / Rian Hughes
- **Avenir LT Pro** — Monotype, or Adobe Fonts (web serving included)

When the licensed `.woff2` files arrive, overwrite the two files in
`public/fonts/` using the same names. Nothing else changes, and the
reconstruction notes below stop applying.

---

## Where each glyph came from

### Avenir Light — complete, no reconstruction

Extracted from `/System/Library/Fonts/Avenir.ttc` (face index 6,
`Avenir-Light`). 418 codepoints, full Latin coverage, nothing synthesised.

One gap: this cut has **no rupee sign (₹)**. Prices fall back to the next font
in the stack, which carries it. The licensed Avenir LT Pro should include it;
check after swapping.

### Chantal Medium — 92 codepoints, from three sources

**1. Traced from the guidelines PDF (the bulk of the face).**
`OLÉ LIBRE BRAND GUIDELINES 2026.pdf` embeds Chantal as per-page subsets. All
14 were extracted with `mutool extract` and merged with fontTools, giving 85
codepoints — every glyph the document actually used.

**2. Traced from `brand-source/font.png` — `J` and `W`.**
The PDF's own specimen omits J, U and W, and no page of it sets a Chantal J or
W, so neither glyph was in any subset. The supplied specimen image shows a
complete alphabet, so both were traced from it (potrace, 14× upscale) and
fitted to the font. Scale and baseline were calibrated against a letter present
in *both* the image and the font — `H` for row 1, `N` for row 2 — so the fit
comes from the font's own metrics rather than a guess.

**3. Derived from Chantal's own forms — 5 glyphs.**
These appear in neither source. Each is built from letters the font already
has, so nothing is drawn freehand or borrowed from another typeface:

| Glyph | Derivation |
|---|---|
| `v` | capital `V` scaled 0.940× into `w`'s lowercase register |
| `x` | capital `X` scaled 1.098× into `o`'s lowercase register |
| `’` | `,` lifted 387 units to `H`'s cap height |
| `"` | two lifted commas, 156 units apart |
| `É` | `E` plus an acute cut down from the `/` (0.175×) |

The five derivations are the least faithful part of the face. `É` in particular
(used by "Sparkling Rosé") has an acute that is a touch light. All five are
replaced automatically the moment a licensed Chantal is dropped in.

### Not covered

The waving-hand emoji in the footer falls back to the system emoji font, as it
should — no text face carries it.

---

## Reproducing this

The scripts are not committed; the sequence was:

```
mutool extract <guidelines.pdf>          # pull the embedded subsets
fontTools.merge                          # union them into one face
potrace                                  # trace J and W out of font.png
fontTools pens                           # fit the traced glyphs, derive the rest
fonttools ttLib.woff2 compress           # ship it
```

The merged-but-unmodified subsets are kept in `brand-source/extracted-fonts/`
for reference.
