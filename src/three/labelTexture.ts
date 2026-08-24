import * as THREE from 'three';

/**
 * The bottle label, wrapped onto the cylinder.
 * ============================================================================
 * When the supplied artwork is available (`palette.labelArt`) it is drawn 1:1
 * onto the wrap — not recoloured, not cropped, not restyled. The artwork is
 * placed TWICE, 180° apart, because the cylinder's UV runs once around the
 * bottle and a real bottle carries a front and a back label.
 *
 * The drawn placeholder below is the fallback for a SKU whose artwork has not
 * been supplied yet, and for the moment before the image decodes. It is
 * deliberately marked so it can never be mistaken for real packaging.
 */

const W = 1536;
const H = 640;

/** The two label positions around the wrap. */
const CENTRES = [W * 0.25, W * 0.75];

function paintGround(ctx: CanvasRenderingContext2D, ground: string, accent: string) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, W, H);

  // Polka field across the whole wrap, so the label is consistent all the way round.
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.24;
  for (let y = 32; y < H; y += 44) {
    for (let x = 22; x < W; x += 44) {
      ctx.beginPath();
      ctx.arc(x + (Math.round(y / 44) % 2 ? 22 : 0), y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** Fallback mark — only ever seen when no artwork has been supplied. */
function paintPlaceholder(ctx: CanvasRenderingContext2D, ink: string) {
  for (const cx of CENTRES) {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 168, 176);
    ctx.lineTo(cx + 168, 176);
    ctx.moveTo(cx - 168, 470);
    ctx.lineTo(cx + 168, 470);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 150px Chantal, "Trebuchet MS", sans-serif';
    ctx.fillText('LIBRE', cx, 318);
    ctx.globalAlpha = 0.38;
    ctx.font = '300 22px Avenir, Mulish, sans-serif';
    ctx.fillText('LABEL ARTWORK — PLACEHOLDER', cx, 530);
    ctx.restore();
  }
}

/**
 * Draws the supplied artwork at both wrap positions, contained, never cropped.
 * The ground is cleared first: the artwork is a cut-out, so everything around
 * it stays transparent and the glass reads through, the way a real bottle
 * carries two discrete labels rather than a painted band.
 */
function paintArtwork(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  ctx.clearRect(0, 0, W, H);
  const pad = 18;
  const maxH = H - pad * 2;
  const maxW = W * 0.44;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;

  for (const cx of CENTRES) {
    ctx.drawImage(img, cx - w / 2, (H - h) / 2, w, h);
  }
}

export function makeLabelTexture(
  ground: string,
  ink: string,
  accent: string,
  artSrc: string | null = null,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  paintGround(ctx, ground, accent);
  paintPlaceholder(ctx, ink);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  if (artSrc) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // Repaint from scratch so the placeholder never shows through the artwork.
      paintArtwork(ctx, img);
      texture.needsUpdate = true;
    };
    // A missing file leaves the placeholder in place rather than a blank wrap.
    img.onerror = () => {};
    img.src = artSrc;
  }

  return texture;
}
