import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = [];
for (const [filename, name] of [
  ['image.png', 'closed-carton'], ['image copy.png', 'warehouse-pallet'],
  ['image copy 2.png', 'carton-closed-front'], ['image copy 3.png', 'carton-closed-angle'],
  ['image copy 4.png', 'carton-open-row'], ['image copy 5.png', 'carton-open-angle'],
  ['image copy 6.png', 'carton-closed-wide'], ['image copy 7.png', 'carton-closed-side'],
  ['image copy 8.png', 'warehouse-pack-stack'], ['image copy 9.png', 'warehouse-carton-stack'],
]) {
  const source = `docs/assets/source/range-variants/${filename}`;
  const input = await readFile(source);
  const metadata = await sharp(input).metadata();
  let pipeline = sharp(input).rotate().toColourspace('srgb');
  if (metadata.hasAlpha) pipeline = pipeline.trim({ background: '#00000000', threshold: 10 });
  const { data, info } = await pipeline.resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer({ resolveWithObject: true });
  const output = `/images/products/${name}.webp`;
  await writeFile(`public${output}`, data);
  assets.push({ source, sha256: createHash('sha256').update(input).digest('hex'), sourceWidth: metadata.width, sourceHeight: metadata.height, sourceAlpha: metadata.hasAlpha, output, width: info.width, height: info.height, alpha: (await sharp(data).metadata()).hasAlpha, bytes: data.length });
}
await writeFile('docs/assets/range-variants-manifest.json', JSON.stringify({ status: 'Supplied proposed packaging artwork. Printed pack quantities/claims not verified; see content/claims.ts and asset specifications.', assets }, null, 2) + '\n');
console.log(assets);
