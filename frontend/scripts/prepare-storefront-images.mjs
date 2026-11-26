import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

// Existing Sharp installation used by Next/image; no additional image dependency.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sources = "docs/assets/source/storefront";
const entries = [
  ["750ml-glass-bottle", "public/images/products/750ml-glass-bottle.webp", true],
  ["1-5l-bottle", "public/images/products/1-5l-bottle.webp", true],
  ["carton-packs", "public/images/products/carton-packs.webp", true],
  ["distributor-supply", "public/images/services/distributor-supply.webp", true],
  ["origin-landscape", "public/images/origin/origin-landscape.webp", true],
  ...["sachet-water", "customised-corporate-water", "wedding-event-water", "traditional-marriage-water"]
    .map(name => [name, `docs/assets/prepared/unconfirmed/${name}.webp`, false]),
];
const manifest = [];
for (const [name, destination, published] of entries) {
  const source = `${sources}/rock-tama-${name}.png`;
  const input = await readFile(resolve(root, source));
  const original = await sharp(input).metadata();
  let image = sharp(input).rotate().toColourspace("srgb");
  // Only remove transparent outer canvas, never crop or regenerate the artwork itself.
  if (original.hasAlpha) image = image.trim({ background: "#00000000", threshold: 10 });
  const { data, info } = await image.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer({ resolveWithObject: true });
  await mkdir(dirname(resolve(root, destination)), { recursive: true });
  await writeFile(resolve(root, destination), data);
  manifest.push({ name, source, destination, published, sourceSha256: createHash("sha256").update(input).digest("hex"), sourceBytes: input.length, width: info.width, height: info.height, bytes: data.length, alpha: info.hasAlpha, transparentCanvasTrimmed: Boolean(original.hasAlpha) });
  console.log(`${name}: ${info.width}×${info.height}, ${Math.round(input.length / 1024)} → ${Math.round(data.length / 1024)} KiB${published ? " (live)" : " (unconfirmed; not served)"}`);
}
await writeFile(resolve(root, "docs/assets/storefront-manifest.json"), JSON.stringify({ provenance: "Owner-supplied storefront artwork, integrated 2026-11-16. Not evidence of product availability, pack quantities, certification or actual spring-site photography.", processor: `sharp ${sharp.versions.sharp}`, assets: manifest }, null, 2) + "\n");
