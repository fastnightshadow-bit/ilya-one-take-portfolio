import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const outputs = [
  { path: 'public/assets/portrait/portrait-720.avif', width: 720, height: 900, format: 'heif', mediaType: 'image/avif' },
  { path: 'public/assets/portrait/portrait-720.webp', width: 720, height: 900, format: 'webp', mediaType: 'image/webp' },
  { path: 'public/assets/portrait/portrait-1200.avif', width: 1200, height: 1500, format: 'heif', mediaType: 'image/avif' },
  { path: 'public/assets/portrait/portrait-1200.webp', width: 1200, height: 1500, format: 'webp', mediaType: 'image/webp' },
  { path: 'public/assets/portrait/portrait-1200.png', width: 1200, height: 1500, format: 'png', mediaType: 'image/png' },
];

async function colorBounds(file: string, yStart: number, yEnd: number, color: readonly [number, number, number]) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const bounds = { left: info.width, right: -1, top: info.height, bottom: -1 };

  for (let y = yStart; y <= yEnd; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      if (data[offset] === color[0] && data[offset + 1] === color[1] && data[offset + 2] === color[2]) {
        bounds.left = Math.min(bounds.left, x);
        bounds.right = Math.max(bounds.right, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.bottom = Math.max(bounds.bottom, y);
      }
    }
  }

  return bounds;
}

describe('portrait delivery assets', () => {
  it('creates every declared format with exact dimensions and metadata', async () => {
    for (const output of outputs) {
      expect(existsSync(output.path)).toBe(true);
      const metadata = await sharp(output.path).metadata();
      expect(metadata).toMatchObject({
        width: output.width,
        height: output.height,
        format: output.format,
        mediaType: output.mediaType,
      });
    }
  });

  it('creates an optimized 1200 by 630 PNG social card', async () => {
    expect(existsSync('public/social-card.png')).toBe(true);
    const metadata = await sharp('public/social-card.png').metadata();
    expect(metadata).toMatchObject({ width: 1200, height: 630, format: 'png', mediaType: 'image/png' });
    expect(statSync('public/assets/portrait/portrait-1200.png').size).toBeLessThan(1_500_000);
  });

  it('keeps each social-card headline inside a 64px horizontal safe area', async () => {
    const lightHeadline = await colorBounds('public/social-card.png', 170, 350, [241, 238, 230]);
    const coralHeadline = await colorBounds('public/social-card.png', 350, 500, [255, 85, 61]);

    for (const bounds of [lightHeadline, coralHeadline]) {
      expect(bounds.left).toBeGreaterThanOrEqual(64);
      expect(bounds.right).toBeLessThanOrEqual(1136);
    }
  });
});
