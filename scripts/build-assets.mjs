import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const input = 'src/assets/source/portrait-clean-neutral.png';
const output = 'public/assets/portrait';
await mkdir(output, { recursive: true });

const render = (width, format) => {
  const pipeline = sharp(input).resize(width, Math.round(width * 1.25), { fit: 'cover', position: 'north' });
  if (format === 'avif') return pipeline.avif({ quality: 58, effort: 5 }).toFile(`${output}/portrait-${width}.avif`);
  if (format === 'webp') return pipeline.webp({ quality: 78, effort: 5 }).toFile(`${output}/portrait-${width}.webp`);
  return pipeline.png({ compressionLevel: 9 }).toFile(`${output}/portrait-${width}.png`);
};

await Promise.all([
  render(720, 'avif'),
  render(720, 'webp'),
  render(1200, 'avif'),
  render(1200, 'webp'),
  render(1200, 'png'),
]);

const socialCard = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0c10"/>
  <circle cx="1050" cy="110" r="210" fill="#ff553d"/>
  <text x="70" y="105" fill="#f1eee6" font-family="Arial" font-size="26" font-weight="700">ILYA / WEB DEVELOPER</text>
  <text x="70" y="330" fill="#f1eee6" font-family="Arial" font-size="118" font-weight="900">САЙТЫ,</text>
  <text x="70" y="455" fill="#ff553d" font-family="Arial" font-size="118" font-weight="900">КОТОРЫЕ ПОМНЯТ.</text>
  <text x="74" y="550" fill="#aaa7af" font-family="Arial" font-size="30">DESIGN × CODE × LAUNCH</text>
</svg>`);
await sharp(socialCard).png({ compressionLevel: 9 }).toFile('public/social-card.png');
