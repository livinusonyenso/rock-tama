// Quality & Supply spring band (owner-supplied, 2026-11-16; replaces the earlier water artwork): archive source -> optimized WebP. No edits to the artwork.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const source = 'docs/assets/source/quality/spring-band.png';
const output = 'public/images/quality/spring-band.webp';
const input = await readFile(source);
const original = await sharp(input).metadata();
const { data, info } = await sharp(input).rotate().toColourspace('srgb').webp({ quality: 82, effort: 6 }).toBuffer({ resolveWithObject: true });
await writeFile(output, data);
const asset = { source, sha256: createHash('sha256').update(input).digest('hex'), original: { width: original.width, height: original.height, format: original.format, alpha: original.hasAlpha, bytes: input.length }, output, width: info.width, height: info.height, bytes: data.length };
await writeFile('docs/assets/quality-background-manifest.json', JSON.stringify({ status: 'Owner-supplied decorative artwork for the Quality & Supply band; not documentary photography.', asset }, null, 2) + '\n');
console.log(asset);
