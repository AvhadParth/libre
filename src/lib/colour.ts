/**
 * Perceptual colour mixing, for grounds that blend rather than cut.
 *
 * Everything here works in OKLab. Mixing in sRGB takes the shortest path
 * through the RGB cube, which dips through muddy, desaturated middles — the
 * blend from Tempranillo Rouge to Verdejo Vine passes through a dead brown,
 * and Airén Mist to Sol Yellow greys out on the way. OKLab is built so that
 * equal steps look equal, so the midpoint of a blend looks like the midpoint.
 */

export type Rgb = readonly [number, number, number];
export type Oklab = readonly [number, number, number];

const srgbToLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (c: number) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
};

export function rgbToOklab([r, g, b]: Rgb): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

export function oklabToRgb([L, a, b]: Oklab): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
}

/** Parse the `rgb(r, g, b)` / `rgba(...)` a computed style hands back. */
export function parseRgb(value: string): Rgb {
  const nums = value.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return [0, 0, 0];
  return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
}

export const rgbToCss = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`;

/** Blend two OKLab colours. `t` 0 → first, 1 → second. */
export function mixOklab(a: Oklab, b: Oklab, t: number): Oklab {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/**
 * Reads what a theme actually resolves to, rather than duplicating the palette
 * in JS where it could drift from the stylesheet.
 *
 * Custom properties cannot be read back reliably — `getPropertyValue('--bg')`
 * hands back the unresolved token — so each one is carried on a real colour
 * property of a throwaway probe and read off the computed style, which is
 * always a concrete `rgb()`.
 */
export type ThemeColours = { bg: Oklab; fg: Oklab; accent: Oklab; accent2: Oklab };

export function readThemeColours(themes: readonly string[]): Map<string, ThemeColours> {
  const out = new Map<string, ThemeColours>();
  if (typeof document === 'undefined') return out;

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;width:0;height:0;' +
    'background-color:var(--bg);color:var(--fg);' +
    'border-top-color:var(--accent);text-decoration-color:var(--accent-2);';
  document.body.appendChild(probe);

  for (const theme of themes) {
    probe.dataset.theme = theme;
    const cs = getComputedStyle(probe);
    out.set(theme, {
      bg: rgbToOklab(parseRgb(cs.backgroundColor)),
      fg: rgbToOklab(parseRgb(cs.color)),
      accent: rgbToOklab(parseRgb(cs.borderTopColor)),
      accent2: rgbToOklab(parseRgb(cs.textDecorationColor)),
    });
  }

  probe.remove();
  return out;
}
