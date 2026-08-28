import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const outputs = [
  'public/assets/portrait/portrait-720.avif',
  'public/assets/portrait/portrait-720.webp',
  'public/assets/portrait/portrait-1200.avif',
  'public/assets/portrait/portrait-1200.webp',
  'public/assets/portrait/portrait-1200.png',
];

describe('portrait delivery assets', () => {
  it('creates every declared format with fixed 4:5 dimensions', async () => {
    for (const output of outputs) {
      expect(existsSync(output)).toBe(true);
      const metadata = await sharp(output).metadata();
      expect(metadata.width! / metadata.height!).toBeCloseTo(4 / 5, 2);
    }
  });

  it('creates the 1200 by 630 social card', async () => {
    expect(existsSync('public/social-card.png')).toBe(true);
    const metadata = await sharp('public/social-card.png').metadata();
    expect({ width: metadata.width, height: metadata.height }).toEqual({ width: 1200, height: 630 });
  });
});
