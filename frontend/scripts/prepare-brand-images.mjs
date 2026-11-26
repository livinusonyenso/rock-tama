// Preserve supplied artwork; trim only transparent outer canvas and optimize delivery.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = [];
for (const [name, output, logo] of [
  ['horizontal.ROCK.TAMA.png', 'public/images/brand/rock-tama-horizontal.webp', true],
  ['stacked.ROCK.TAMA.png', 'public/images/brand/rock-tama-stacked.webp', true],
  ['herobackground.png', 'public/images/hero/spring-water.webp', false],
]) {
  const source = `docs/assets/source/branding/${name}`;
  const input = await readFile(source);
  const original = await sharp(input).metadata();
  let pipeline = sharp(input).rotate().toColourspace('srgb');
  if (logo) pipeline = pipeline.trim({ background: '#00000000', threshold: 10 }).resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true });
  const { data, info } = await pipeline.webp(logo ? { lossless: true, effort: 6 } : { quality: 85, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(output, data);
  assets.push({ source, sha256: createHash('sha256').update(input).digest('hex'), original: { width: original.width, height: original.height, format: original.format, alpha: original.hasAlpha, bytes: input.length }, output, width: info.width, height: info.height, bytes: data.length, alpha: (await sharp(data).metadata()).hasAlpha });
}
await writeFile('docs/assets/branding-manifest.json', JSON.stringify({ status: 'Owner-supplied proposed branding; pending final client approval. Background is decorative artwork, not verified source-site photography.', assets }, null, 2) + '\n');
console.log(assets);
