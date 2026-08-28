import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('test and release scripts cover unit, script, production E2E, SEO, and Lighthouse gates', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

  assert.equal(packageJson.scripts['test:unit'], 'vitest run');
  assert.equal(packageJson.scripts['test:scripts'], 'node --test scripts/*.test.mjs');
  assert.equal(packageJson.scripts.test, 'npm run test:unit && npm run test:scripts');
  assert.equal(packageJson.scripts['verify:dist-seo'], 'node scripts/verify-dist-seo.mjs');
  assert.equal(packageJson.scripts['test:dist-seo'], 'npm run build && npm run verify:dist-seo');
  assert.equal(packageJson.scripts.e2e, 'playwright test');
  assert.equal(packageJson.scripts['e2e:prod'], 'playwright test --config playwright.prod.config.ts');
  assert.equal(packageJson.scripts.audit, 'node scripts/run-lighthouse.mjs');
  assert.equal(packageJson.scripts.check, 'npm run test && npm run build && npm run verify:dist-seo && npm run e2e:prod && npm run audit');
});

test('production E2E serves dist on a dedicated port without reusing a dev server', async () => {
  const configUrl = new URL('../playwright.prod.config.ts', import.meta.url);
  assert.equal(existsSync(fileURLToPath(configUrl)), true, 'playwright.prod.config.ts must exist');
  const config = (await import(configUrl.href)).default;
  const webServer = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;

  assert.equal(config.use.baseURL, 'http://127.0.0.1:4174');
  assert.equal(webServer.command, 'npm run preview -- --port 4174');
  assert.equal(webServer.port, 4174);
  assert.equal(webServer.reuseExistingServer, false);
});
