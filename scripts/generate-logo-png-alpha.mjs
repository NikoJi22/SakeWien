/**
 * public/sake-logo-mark.png war JPEG-Bytes unter .png — keine Transparenz möglich.
 * Liest die Datei, erzeugt echte RGBA-PNG (dunkler Hintergrund → transparent, weicher Rand).
 */
import sharp from "sharp";
import { writeFile, rename, unlink } from "fs/promises";

/** Optional: Pfad zu neuer Quelle (JPEG oder PNG). Standard: bestehende `public/sake-logo-mark.png`. */
const INPUT = process.argv[2] || "public/sake-logo-mark.png";
const OUT_MARK = "public/sake-logo-mark.png";
const OUT_FULL = "public/sake-logo.png";
const TMP_MARK = "public/.sake-logo-mark.png.tmp";
const TMP_FULL = "public/.sake-logo.png.tmp";

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Unterhalb L0 transparent, oberhalb L1 deckend, dazwischen linear (Anti-Alias). */
function alphaForRgb(r, g, b, L0 = 42, L1 = 78) {
  const L = luminance(r, g, b);
  if (L <= L0) return 0;
  if (L >= L1) return 255;
  return Math.round(((L - L0) / (L1 - L0)) * 255);
}

async function main() {
  const meta = await sharp(INPUT).metadata();
  if (meta.format === "png" && meta.hasAlpha) {
    const pngBuf = await sharp(INPUT).png({ compressionLevel: 9, effort: 10 }).toBuffer();
    await writeFile(TMP_MARK, pngBuf);
    await writeFile(TMP_FULL, pngBuf);
    await unlink(OUT_MARK).catch(() => {});
    await unlink(OUT_FULL).catch(() => {});
    await rename(TMP_MARK, OUT_MARK);
    await rename(TMP_FULL, OUT_FULL);
    console.log("PNG mit Alpha übernommen →", OUT_MARK, OUT_FULL, `(${meta.width}x${meta.height})`);
    return;
  }

  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) {
    throw new Error(`expected 4 channels, got ${info.channels}`);
  }

  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    out[i + 3] = alphaForRgb(out[i], out[i + 1], out[i + 2]);
  }

  const pngBuf = await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  await writeFile(TMP_MARK, pngBuf);
  await writeFile(TMP_FULL, pngBuf);
  await unlink(OUT_MARK).catch(() => {});
  await unlink(OUT_FULL).catch(() => {});
  await rename(TMP_MARK, OUT_MARK);
  await rename(TMP_FULL, OUT_FULL);
  console.log("Wrote", OUT_MARK, "and", OUT_FULL, `(${info.width}x${info.height}, RGBA PNG)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
