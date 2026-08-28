import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const cliPath = fileURLToPath(new URL('../node_modules/@lhci/cli/src/cli.js', import.meta.url));
const result = spawnSync(process.execPath, [cliPath, 'autorun'], {
  env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath() },
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
