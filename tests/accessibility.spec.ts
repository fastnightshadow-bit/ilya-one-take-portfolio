import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const expectedLinks = [
  { name: 'ILYA / WEB DEVELOPER', href: '#top' },
  { name: '@girtopw ↗', href: 'https://t.me/girtopw' },
  { name: 'Смотреть дальше ↓', href: '#about' },
  { name: 'Написать в Telegram →', href: 'https://t.me/girtopw' },
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('exposes one banner, named navigation, and main landmark', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
});

test('uses one h1 and never skips a heading level', async ({ page }) => {
  const headings = await page.getByRole('heading').evaluateAll((elements) =>
    elements.map((element) => ({ level: Number(element.tagName.slice(1)), text: element.textContent?.trim() ?? '' })),
  );
  expect(headings[0]).toMatchObject({ level: 1 });
  expect(headings.filter(({ level }) => level === 1)).toHaveLength(1);
  for (let index = 1; index < headings.length; index += 1) {
    expect(headings[index]!.level, `heading after "${headings[index - 1]!.text}" skips a level`).toBeLessThanOrEqual(headings[index - 1]!.level + 1);
  }
});

test('gives every link an approved accessible name and destination', async ({ page }) => {
  const links = page.getByRole('link');
  await expect(links).toHaveCount(expectedLinks.length);
  for (const [index, expectedLink] of expectedLinks.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(expectedLink.name);
    await expect(links.nth(index)).toHaveAttribute('href', expectedLink.href);
  }
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard traversal reaches every interactive link with visible, unobscured focus', async ({ page }) => {
  const header = page.locator('.site-header');
  for (const expectedLink of expectedLinks) {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toHaveAccessibleName(expectedLink.name);
    await expect(focused).toBeVisible();

    await expect.poll(() => focused.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(page.viewportSize()!.height);

    const focusMetrics = await focused.evaluate((element) => {
      const styles = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      const stickyHeader = document.querySelector('.site-header')!.getBoundingClientRect();
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
        withinHeader: element.closest('.site-header') !== null,
        top: bounds.top,
        bottom: bounds.bottom,
        headerBottom: stickyHeader.bottom,
      };
    });

    expect(focusMetrics.outlineStyle).not.toBe('none');
    expect(focusMetrics.outlineWidth).toBeGreaterThanOrEqual(3);
    if (!focusMetrics.withinHeader) expect(focusMetrics.top).toBeGreaterThanOrEqual(focusMetrics.headerBottom + 4);
  }

  await expect(header).toBeVisible();
});

test('portrait is described and visual carriers stay out of the accessibility tree', async ({ page }) => {
  await expect(page.locator('.about__portrait img')).toHaveAttribute('alt', 'Илья, веб-разработчик');

  const decorativeSelectors = [
    '.about__scribble',
    '[data-transition]',
    '.doner-poster',
    '.school-road',
    '.school-sign',
    '.bot-phone',
  ];
  for (const selector of decorativeSelectors) {
    const decorations = page.locator(selector);
    expect(await decorations.count(), `${selector} should exist`).toBeGreaterThan(0);
    for (const decoration of await decorations.all()) await expect(decoration).toHaveAttribute('aria-hidden', 'true');
  }
});
