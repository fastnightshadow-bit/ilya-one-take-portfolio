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
  const config = await readFile(configUrl, 'utf8');

  assert.match(config, /command:\s*['"]npm run preview -- --port 4174['"]/);
  assert.match(config, /port:\s*4174/);
  assert.match(config, /reuseExistingServer:\s*false/);
  assert.match(config, /baseURL:\s*['"]http:\/\/127\.0\.0\.1:4174['"]/);
});

test('GitHub Pages workflow deploys a verified dist artifact from main', async () => {
  const workflowUrl = new URL('../.github/workflows/deploy-pages.yml', import.meta.url);
  assert.equal(existsSync(fileURLToPath(workflowUrl)), true, 'deploy-pages.yml must exist');

  const workflow = await readFile(workflowUrl, 'utf8');

  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*read\s*\n\s+pages:\s*write\s*\n\s+id-token:\s*write/);
  assert.match(workflow, /uses:\s*actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /uses:\s*actions\/setup-node@[0-9a-f]{40}/);
  assert.match(workflow, /node-version:\s*['"]22\.13\.0['"]/);
  assert.match(workflow, /- run:\s*npm ci/);
  assert.match(workflow, /- run:\s*npm run test/);
  assert.match(workflow, /- run:\s*npm run build/);
  assert.match(workflow, /- run:\s*npm run verify:dist-seo/);
  assert.match(workflow, /uses:\s*actions\/configure-pages@[0-9a-f]{40}/);
  assert.match(workflow, /uses:\s*actions\/upload-pages-artifact@[0-9a-f]{40}[\s\S]*?path:\s*\.\/dist/);
  assert.match(workflow, /id:\s*deployment\s*\n\s+uses:\s*actions\/deploy-pages@[0-9a-f]{40}/);
  assert.match(workflow, /url:\s*\$\{\{\s*steps\.deployment\.outputs\.page_url\s*\}\}/);
});
