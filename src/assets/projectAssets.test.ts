import { existsSync, readdirSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const captures = [
  { id: 'pivnoy-doner-desktop', width: 1280, height: 720, orientation: 'landscape' },
  { id: 'pivnoy-doner-mobile', width: 390, height: 844, orientation: 'portrait' },
  { id: 'driving-school-desktop', width: 1280, height: 720, orientation: 'landscape' },
  { id: 'driving-school-mobile', width: 390, height: 844, orientation: 'portrait' },
  { id: 'shaurma-mobile-mobile', width: 390, height: 844, orientation: 'portrait' },
  { id: 'telegram-shop-mobile', width: 390, height: 844, orientation: 'portrait' },
] as const;

const formats = [
  { extension: 'avif', format: 'heif', mediaType: 'image/avif', maxBytes: 350_000 },
  { extension: 'webp', format: 'webp', mediaType: 'image/webp', maxBytes: 450_000 },
  { extension: 'jpg', format: 'jpeg', mediaType: 'image/jpeg', maxBytes: 600_000 },
] as const;

const generatedOutputs = captures.flatMap((capture) => {
  const widths = capture.orientation === 'landscape' ? [720, 1280] : [390];
  return widths.flatMap((width) => formats.map((format) => ({
    path: `public/assets/projects/${capture.id}-${width}.${format.extension}`,
    width,
    height: capture.orientation === 'landscape' ? Math.round(width * 9 / 16) : 844,
    ...format,
  })));
});

describe('project delivery assets', () => {
  it('keeps one verified source capture for every approved project viewport', async () => {
    for (const capture of captures) {
      const path = `src/assets/source/projects/${capture.id}.jpg`;
      expect(existsSync(path), `${capture.id} source exists`).toBe(true);
      const metadata = await sharp(path).metadata();
      expect(metadata.width, `${capture.id} source width`).toBeGreaterThanOrEqual(capture.width);
      expect(metadata.height, `${capture.id} source height`).toBeGreaterThanOrEqual(capture.height);
      expect(
        capture.orientation === 'landscape' ? metadata.width! > metadata.height! : metadata.height! > metadata.width!,
        `${capture.id} source orientation`,
      ).toBe(true);
    }
  });

  it('creates the exact AVIF, WebP, and JPEG delivery matrix', async () => {
    expect(readdirSync('public/assets/projects').sort()).toEqual(
      generatedOutputs.map((output) => output.path.split('/').at(-1)!).sort(),
    );

    for (const output of generatedOutputs) {
      expect(existsSync(output.path), `${output.path} exists`).toBe(true);
      const metadata = await sharp(output.path).metadata();
      expect(metadata, output.path).toMatchObject({
        width: output.width,
        height: output.height,
        format: output.format,
        mediaType: output.mediaType,
      });
      expect(statSync(output.path).size, `${output.path} byte budget`).toBeLessThan(output.maxBytes);
      expect((await sharp(output.path).stats()).entropy, `${output.path} is not blank`).toBeGreaterThan(1.5);
    }
  });
});
