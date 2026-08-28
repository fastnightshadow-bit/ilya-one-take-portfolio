import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dist SEO scripts rebuild before verification and verify once in check', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

  assert.equal(packageJson.scripts['verify:dist-seo'], 'node scripts/verify-dist-seo.mjs');
  assert.equal(packageJson.scripts['test:dist-seo'], 'npm run build && npm run verify:dist-seo');
  assert.equal(packageJson.scripts.check, 'npm run test && npm run build && npm run verify:dist-seo && npm run e2e');
});
