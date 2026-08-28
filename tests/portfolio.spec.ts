import { expect, test } from '@playwright/test';

const approvedScenes = ['hero', 'about', 'pivnoy-doner', 'driving-school', 'telegram-shop', 'contact'];

test('story is ordered, readable, and has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Сайты, которые');
  expect(await page.locator('[data-scene]').evaluateAll((scenes) => scenes.map((scene) => scene.getAttribute('data-scene')))).toEqual(approvedScenes);
  const projects = page.locator('[data-project]');
  await expect(projects).toHaveCount(3);
  for (const project of await projects.all()) await expect(project).toBeVisible();

  const microcopyMetrics = await page.evaluate(() => {
    const channels = (color: string) => {
      const value = color.trim();
      if (/^#[\da-f]{6}$/i.test(value)) return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
      return value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    };
    const luminance = (color: string) => {
      const normalized = channels(color).map((channel) => {
        const value = channel / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
      });
      return .2126 * (normalized[0] ?? 0) + .7152 * (normalized[1] ?? 0) + .0722 * (normalized[2] ?? 0);
    };
    const rootStyles = getComputedStyle(document.documentElement);
    const checks = [
      { selector: '.about__facts small', background: rootStyles.getPropertyValue('--paper') },
      { selector: '.process p', background: rootStyles.getPropertyValue('--ink') },
    ] as const;
    return checks.flatMap(({ selector, background }) => [...document.querySelectorAll(selector)].map((element) => {
      const styles = getComputedStyle(element);
      const lighter = Math.max(luminance(styles.color), luminance(background));
      const darker = Math.min(luminance(styles.color), luminance(background));
      return { selector, fontSize: Number.parseFloat(styles.fontSize), contrast: (lighter + .05) / (darker + .05) };
    }));
  });
  for (const metric of microcopyMetrics) {
    expect(metric.fontSize, `${metric.selector} font size`).toBeGreaterThanOrEqual(12);
    expect(metric.contrast, `${metric.selector} contrast`).toBeGreaterThanOrEqual(4.5);
  }

  expect(await page.locator('.site-header').evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  await page.evaluate(() => window.scrollTo(0, 800));
  expect(await page.locator('.site-header').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('[data-primary-cta]').last()).toHaveAttribute('href', 'https://t.me/girtopw');
});

test('story motion progresses without shifting the rotating hero word', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-motion-ready', '');

  const rotatingWord = page.locator('[data-rotating-word]');
  const firstWord = await rotatingWord.textContent();
  const firstWidth = await rotatingWord.evaluate((element) => element.getBoundingClientRect().width);
  await expect.poll(() => rotatingWord.textContent()).not.toBe(firstWord);
  const secondWidth = await rotatingWord.evaluate((element) => element.getBoundingClientRect().width);
  expect(Math.abs(secondWidth - firstWidth)).toBeLessThanOrEqual(0.5);

  const scribble = page.locator('.about__scribble path').first();
  expect(Number.parseFloat(await scribble.evaluate((element) => getComputedStyle(element).strokeDashoffset))).toBeGreaterThan(1000);
  await page.locator('.about').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight * 0.3);
  });
  await expect.poll(async () => Number.parseFloat(await scribble.evaluate((element) => getComputedStyle(element).strokeDashoffset))).toBeLessThan(10);

  const caseCopy = page.locator('[data-project] .case__copy').first();
  await page.locator('[data-project]').first().evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.top - window.innerHeight * 0.2);
  });
  await expect.poll(async () => Number.parseFloat(await caseCopy.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  await expect.poll(async () => await caseCopy.evaluate((element) => getComputedStyle(element).transform)).toMatch(/matrix\([^)]*, 0\)$/);

  const bridgePhrase = page.locator('[data-transition] strong').nth(2);
  const bridgeStart = await bridgePhrase.evaluate((element) => getComputedStyle(element).transform);
  await page.locator('[data-transition]').nth(2).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.bottom - window.innerHeight * 0.1);
  });
  await expect.poll(async () => await bridgePhrase.evaluate((element) => getComputedStyle(element).transform)).not.toBe(bridgeStart);

  expect(errors).toEqual([]);
});

test('reduced motion keeps all content visible and static', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('[data-project]')).toHaveCount(3);
  await expect(page.locator('[data-scene="contact"]')).toBeVisible();
  await expect(page.locator('#app')).not.toHaveAttribute('data-motion-ready', '');
  const word = page.locator('[data-rotating-word]');
  const staticWord = await word.textContent();
  await page.waitForTimeout(2100);
  await expect(word).toHaveText(staticWord ?? '');

  await context.close();
});
