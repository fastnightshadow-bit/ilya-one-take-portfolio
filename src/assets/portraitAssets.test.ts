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

interface TextBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly pixelCount?: number;
}

function assertVisibleTextBounds(bounds: TextBounds, label: string) {
  if (bounds.pixelCount === undefined || bounds.pixelCount <= 500) throw new Error(`${label} has enough exact fill pixels`);
  expect(bounds.left, `${label} left safe margin`).toBeGreaterThanOrEqual(64);
  expect(bounds.right, `${label} right safe margin`).toBeLessThanOrEqual(1136);
}

async function colorBounds(file: string, yStart: number, yEnd: number, color: readonly [number, number, number]): Promise<TextBounds> {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const bounds = { left: info.width, right: -1, top: info.height, bottom: -1, pixelCount: 0 };

  for (let y = yStart; y <= yEnd; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      if (data[offset] === color[0] && data[offset + 1] === color[1] && data[offset + 2] === color[2]) {
        bounds.pixelCount += 1;
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

  it('fails closed when a controlled required text band has no pixels', () => {
    expect(() => assertVisibleTextBounds({ left: 1200, right: -1, top: 630, bottom: -1 }, 'controlled blank band'))
      .toThrow(/has enough exact fill pixels/);
  });

  it('keeps every social-card headline band visible inside a 64px horizontal safe area', async () => {
    const bands = [
      { label: 'light title', yStart: 170, yEnd: 300, color: [241, 238, 230] as const },
      { label: 'coral headline line one', yStart: 300, yEnd: 410, color: [255, 85, 61] as const },
      { label: 'coral headline line two', yStart: 410, yEnd: 520, color: [255, 85, 61] as const },
    ];

    for (const band of bands) assertVisibleTextBounds(
      await colorBounds('public/social-card.png', band.yStart, band.yEnd, band.color),
      band.label,
    );
  });
});
