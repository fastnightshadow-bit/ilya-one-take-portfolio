import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export const projectCaptures = [
  { id: 'pivnoy-doner-desktop', file: 'pivnoy-doner-desktop.jpg', kind: 'desktop' },
  { id: 'pivnoy-doner-mobile', file: 'pivnoy-doner-mobile.jpg', kind: 'mobile' },
  { id: 'driving-school-desktop', file: 'driving-school-desktop.jpg', kind: 'desktop' },
  { id: 'driving-school-mobile', file: 'driving-school-mobile.jpg', kind: 'mobile' },
  { id: 'shaurma-mobile-mobile', file: 'shaurma-mobile-mobile.jpg', kind: 'mobile' },
  { id: 'shaurma-mobile-menu', file: 'shaurma-mobile-menu.jpg', kind: 'mobile' },
  { id: 'shaurma-mobile-cart', file: 'shaurma-mobile-cart.jpg', kind: 'mobile' },
  { id: 'telegram-shop-mobile', file: 'telegram-shop-mobile.jpg', kind: 'mobile' },
  { id: 'telegram-shop-cart', file: 'telegram-shop-cart.jpg', kind: 'mobile' },
  { id: 'telegram-shop-checkout', file: 'telegram-shop-checkout.jpg', kind: 'mobile' },
];

function projectAsset(capture, sourceRoot, outputRoot, width, extension) {
  const height = capture.kind === 'desktop' ? Math.round(width * 9 / 16) : 844;
  const pipeline = sharp(join(sourceRoot, capture.file)).resize(width, height, {
    fit: 'cover',
    position: capture.kind === 'desktop' ? 'north' : 'centre',
  });
  const path = join(outputRoot, `${capture.id}-${width}.${extension}`);

  if (extension === 'avif') return pipeline.avif({ quality: 56, effort: 5 }).toFile(path);
  if (extension === 'webp') return pipeline.webp({ quality: 78, effort: 5 }).toFile(path);
  return pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(path);
}

export async function buildProjectAssets({
  sourceRoot = 'src/assets/source/projects',
  outputRoot = 'public/assets/projects',
} = {}) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  await Promise.all(projectCaptures.flatMap((capture) => {
    const widths = capture.kind === 'desktop' ? [720, 1280] : [390];
    return widths.flatMap((width) => ['avif', 'webp', 'jpg'].map((extension) =>
      projectAsset(capture, sourceRoot, outputRoot, width, extension)));
  }));
}
