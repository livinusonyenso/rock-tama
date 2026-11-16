import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const source = 'docs/assets/source/wholesale/warehouse-hero.png';
const input = await readFile(source);
const original = await sharp(input).metadata();
const {data,info} = await sharp(input).rotate().toColourspace('srgb').resize({width:1920,withoutEnlargement:true}).webp({quality:85,effort:6}).toBuffer({resolveWithObject:true});
await writeFile('public/images/wholesale/warehouse-hero.webp',data);
await writeFile('docs/assets/wholesale-background-manifest.json',JSON.stringify({source,deliveredFilename:'public/images/wholesale/warehouse-hero..png',sha256:createHash('sha256').update(input).digest('hex'),sourceWidth:original.width,sourceHeight:original.height,sourceAlpha:original.hasAlpha,output:'/images/wholesale/warehouse-hero.webp',width:info.width,height:info.height,bytes:data.length,status:'Owner-supplied decorative warehouse illustration; not evidence of an owned facility or inventory.'},null,2)+'\n');
