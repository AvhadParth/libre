# Brand webfonts

| File | Face |
|---|---|
| `Chantal-Medium.woff2` | Chantal Medium — headlines and the logotype |
| `AvenirLTPro-Light.woff2` | Avenir Light — body, captions, product information |

Both are committed. `@font-face` in `src/app/globals.css` points at them and
nothing else needs configuring.

## ⚠️ These are licensed, and this only works while the repo is private

Both faces carry `fsType 0x0004` — **"Preview & Print" embedding only**:

- **Chantal** — © 1993 Rian Hughes / Device Fonts
- **Avenir LT Pro** — © 2014 Monotype GmbH

Two things follow.

**If this repository is ever made public, remove these two files first.** A
public repo publishes the binaries as downloadable assets to anyone.

**Serving them from the deployed site still needs a web licence.** That is a
separate matter from the repo, and it is not resolved. Chantal from Device
Fonts / Rian Hughes; Avenir LT Pro from Monotype or Adobe Fonts, both of which
include web serving. Once licensed files arrive, overwrite these two using the
same names.

Without these the site still runs: headlines fall back to Permanent Marker and
body text to Avenir/Mulish — the right register, the wrong detail.

Full provenance, including which Chantal glyphs were reconstructed and how, is
in [`../../FONTS.md`](../../FONTS.md).
