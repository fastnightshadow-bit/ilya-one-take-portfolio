import { expect, test, type Page } from '@playwright/test';

const telegramPresentation = (page: Page) => page.locator('[data-scene="telegram-shop"]').evaluate((scene) => {
  const layout = scene.querySelector<HTMLElement>('.case__layout')!;
  const headline = scene.querySelector<HTMLElement>('.case__headline')!;
  const action = scene.querySelector<HTMLElement>('.case__action')!;
  const phone = scene.querySelector<HTMLElement>('[data-project-shot="mobile"]')!;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(phone).transform);

  return {
    background: getComputedStyle(scene).backgroundColor,
    columns: getComputedStyle(layout).gridTemplateColumns.split(' ').length,
    gap: getComputedStyle(layout).gap,
    alignItems: getComputedStyle(layout).alignItems,
    headlineSize: Number.parseFloat(getComputedStyle(headline).fontSize),
    actionBackground: getComputedStyle(action).backgroundColor,
    actionColor: getComputedStyle(action).color,
    phoneAngle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
    phoneShadow: getComputedStyle(phone).boxShadow,
  };
});

test('published Telegram mobile presentation remains unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const presentation = await telegramPresentation(page);

  expect({
    background: presentation.background,
    columns: presentation.columns,
    gap: presentation.gap,
    alignItems: presentation.alignItems,
    headlineSize: presentation.headlineSize,
    actionBackground: presentation.actionBackground,
    actionColor: presentation.actionColor,
    phoneShadow: presentation.phoneShadow,
  }).toEqual({
    background: 'rgb(213, 240, 235)',
    columns: 2,
    gap: '12px',
    alignItems: 'center',
    headlineSize: 39,
    actionBackground: 'rgb(11, 87, 208)',
    actionColor: 'rgb(255, 255, 255)',
    phoneShadow: 'rgb(11, 87, 208) 9px 10px 0px 0px',
  });
  expect(presentation.phoneAngle).toBeCloseTo(1.5, 1);
});

test('mobile polish leaves the 1440 project hierarchy unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="desktop"]')).toBeVisible();
  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="mobile"]')).toBeVisible();
  await expect(page.locator('[data-scene="telegram-shop"] .case__layout')).toHaveCSS('align-items', 'center');
  await expect(page.locator('[data-scene="telegram-shop"]')).toHaveCSS('background-color', 'rgb(213, 240, 235)');
});
