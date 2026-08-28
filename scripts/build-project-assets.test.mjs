import assert from 'node:assert/strict';
import { access, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import { buildProjectAssets, projectCaptures } from './build-project-assets.mjs';

test('project asset builder removes stale output and rebuilds an exact isolated matrix', async () => {
  const outputRoot = await mkdtemp(join(tmpdir(), 'ilya-project-assets-'));
  const stalePath = join(outputRoot, 'stale-project-proof.txt');

  try {
    await writeFile(stalePath, 'stale generated output');
    await buildProjectAssets({
      sourceRoot: resolve('src/assets/source/projects'),
      outputRoot,
    });

    await assert.rejects(access(stalePath));
    const files = (await readdir(outputRoot)).sort();
    const expectedNames = projectCaptures.flatMap((capture) => {
      const widths = capture.kind === 'desktop' ? [720, 1280] : [390];
      return widths.flatMap((width) => ['avif', 'webp', 'jpg'].map((extension) => `${capture.id}-${width}.${extension}`));
    }).sort();
    assert.deepEqual(files, expectedNames);

    const sample = await sharp(join(outputRoot, 'driving-school-mobile-390.avif')).metadata();
    assert.deepEqual(
      { width: sample.width, height: sample.height, mediaType: sample.mediaType },
      { width: 390, height: 844, mediaType: 'image/avif' },
    );
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
