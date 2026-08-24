# Brand webfonts go here

Two files, not committed to this repo:

| File | Face |
|---|---|
| `Chantal-Medium.woff2` | Chantal Medium — headlines and the logotype |
| `AvenirLTPro-Light.woff2` | Avenir Light — body, captions, product information |

They are excluded because both are **"Preview & Print" embedding only**
(`fsType 0x0004`) and no web licence has been obtained yet. Committing them to a
public repo would redistribute them.

**To obtain them:** Chantal from Device Fonts / Rian Hughes, Avenir LT Pro from
Monotype or Adobe Fonts (web serving included). Drop the licensed `.woff2` files
in this directory using the names above — `@font-face` in
`src/app/globals.css` already points at them and nothing else needs changing.

Without these the site still runs: headlines fall back to Permanent Marker and
body text to Avenir/Mulish. Close in register, wrong in detail.

Full provenance is in [`../../FONTS.md`](../../FONTS.md).
