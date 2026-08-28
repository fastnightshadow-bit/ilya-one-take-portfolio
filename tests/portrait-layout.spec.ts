import { expect, test } from '@playwright/test';

test('keeps About copy clear of the portrait at supported breakpoints', async ({ page }) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const { ledeBottom, portraitTop } = await page.locator('.about').evaluate((scene) => {
      const sceneTop = scene.getBoundingClientRect().top;
      const lede = scene.querySelector('.about__copy > p:last-child')!.getBoundingClientRect();
      const portrait = scene.querySelector('.about__portrait')!.getBoundingClientRect();
      return { ledeBottom: lede.bottom - sceneTop, portraitTop: portrait.top - sceneTop };
    });

    expect(ledeBottom, `${width}px lede should clear portrait`).toBeLessThanOrEqual(portraitTop - 24);
  }

  for (const width of [1280, 1440, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const { titleRight, portraitLeft } = await page.locator('.about').evaluate((scene) => {
      const sceneLeft = scene.getBoundingClientRect().left;
      const titleText = scene.querySelector('#about-title')!.firstChild!;
      const range = document.createRange();
      range.selectNode(titleText);
      return {
        titleRight: range.getBoundingClientRect().right - sceneLeft,
        portraitLeft: scene.querySelector('.about__portrait')!.getBoundingClientRect().left - sceneLeft,
      };
    });

    expect(titleRight, `${width}px heading should clear portrait`).toBeLessThanOrEqual(portraitLeft - 12);
  }
});

test('selects the 720 portrait source for desktop Chromium at DPR 1', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'DPR 1 source selection is covered by the desktop project');
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(1);

  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const image = page.locator('.about__portrait img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((node) => (node as HTMLImageElement).decode());
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).currentSrc.endsWith('/assets/portrait/portrait-720.avif'))).toBe(true);

    await page.locator('.about__portrait source[type="image/avif"]').evaluate((source) => source.remove());
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).currentSrc.endsWith('/assets/portrait/portrait-720.webp'))).toBe(true);
  }
});
