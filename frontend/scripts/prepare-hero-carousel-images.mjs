import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = [];
for (const [filename, output, bottle] of [
  ['image copy 6.png', 'bottle-750ml-rock-tama.webp', true],
  ['image copy.png', 'bottle-1-5l.webp', true],
  ['image copy 5.png', 'wedding.webp', true],
  ['spring-water.png', 'waterfall-bg.webp', false],
  ['memorial-generated.png', 'memorial.webp', true],
  ['coronation-generated.png', 'coronation.webp', true],
]) {
  const source = `docs/assets/source/hero-carousel/${filename}`;
  const input = await readFile(source);
  const metadata = await sharp(input).metadata();
  let pipeline = sharp(input).rotate().toColourspace('srgb');
  if (bottle) pipeline = pipeline.trim({ background: '#00000000', threshold: 10 }).resize({ height: 1200, withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(`public/images/hero/${output}`, data);
  assets.push({ source, sourceWidth: metadata.width, sourceHeight: metadata.height, sourceAlpha: metadata.hasAlpha, sha256: createHash('sha256').update(input).digest('hex'), output: `/images/hero/${output}`, width: info.width, height: info.height, alpha: (await sharp(data).metadata()).hasAlpha, bytes: data.length });
}
await writeFile('docs/assets/hero-carousel-manifest.json', JSON.stringify({ status: 'Supplied concept artwork; not evidence of availability or printed claims. Memorial and coronation concepts generated with owner permission using supplied bottle reference; pending approval.', assets }, null, 2) + '\n');
console.log(assets);
