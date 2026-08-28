import { mkdir, readFile, rm } from 'node:fs/promises';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { buildProjectAssets } from './build-project-assets.mjs';

const input = 'src/assets/source/portrait-clean-neutral.png';
const output = 'public/assets/portrait';
const projectOutput = 'public/assets/projects';
const socialFont = 'src/assets/fonts/Montserrat-Black.ttf';
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const render = (width, format) => {
  const pipeline = sharp(input).resize(width, Math.round(width * 1.25), { fit: 'cover', position: 'north' });
  if (format === 'avif') return pipeline.avif({ quality: 58, effort: 5 }).toFile(`${output}/portrait-${width}.avif`);
  if (format === 'webp') return pipeline.webp({ quality: 78, effort: 5 }).toFile(`${output}/portrait-${width}.webp`);
  return pipeline
    .grayscale()
    .png({ compressionLevel: 9, palette: true, quality: 90, colours: 256, effort: 10, dither: 0 })
    .toFile(`${output}/portrait-${width}.png`);
};

await Promise.all([
  render(720, 'avif'),
  render(720, 'webp'),
  render(1200, 'avif'),
  render(1200, 'webp'),
  render(1200, 'png'),
]);

await buildProjectAssets({ outputRoot: projectOutput });

const fontBuffer = await readFile(socialFont);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
const textPath = (text, x, y, size, fill) => `<path fill="${fill}" d="${font.getPath(text, x, y, size).toPathData(2)}"/>`;

const socialCard = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0c10"/>
  <circle cx="1040" cy="130" r="132" fill="#ff553d"/>
  ${textPath('ILYA / WEB DEVELOPER', 64, 96, 24, '#f1eee6')}
  ${textPath('САЙТЫ,', 64, 276, 112, '#f1eee6')}
  ${textPath('КОТОРЫЕ', 64, 392, 86, '#ff553d')}
  ${textPath('ПОМНЯТ.', 64, 500, 96, '#ff553d')}
  ${textPath('DESIGN × CODE × LAUNCH', 68, 574, 22, '#aaa7af')}
</svg>`);
await sharp(socialCard).png({ compressionLevel: 9 }).toFile('public/social-card.png');
