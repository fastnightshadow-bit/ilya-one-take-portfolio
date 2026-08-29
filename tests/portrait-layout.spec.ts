import { expect, test } from '@playwright/test';

test('keeps the portrait visible after the real About CTA jump in short landscape', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');

  await page.getByRole('link', { name: 'Смотреть дальше ↓' }).click();
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#about');

  await expect.poll(() => page.locator('.about__portrait').evaluate((portrait) => {
    const bounds = portrait.getBoundingClientRect();
    return Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
  }), { message: '844×390 portrait viewport intersection' }).toBeGreaterThanOrEqual(96);
});

test('keeps at least 90% of the portrait source height visible on wide screens', async ({ page }) => {
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const image = page.locator('.about__portrait img');
    await image.evaluate((node) => (node as HTMLImageElement).decode());
    const visibleSourceFraction = await image.evaluate((node: HTMLImageElement) => {
      const bounds = node.getBoundingClientRect();
      const coverScale = Math.max(bounds.width / node.naturalWidth, bounds.height / node.naturalHeight);
      const renderedSourceHeight = node.naturalHeight * coverScale;
      return Math.min(1, bounds.height / renderedSourceHeight);
    });

    expect(visibleSourceFraction, `${viewport.width}×${viewport.height} visible source height`).toBeGreaterThanOrEqual(.9);
  }
});

test('keeps short-landscape portrait and About copy in bounds at the 701px tier', async ({ page }) => {
  await page.setViewportSize({ width: 701, height: 390 });
  await page.goto('/');

  const geometry = await page.locator('.about').evaluate((scene) => {
    const title = scene.querySelector('#about-title')!.getBoundingClientRect();
    const promise = scene.querySelector('[data-about-promise]')!.getBoundingClientRect();
    const portrait = scene.querySelector('.about__portrait')!.getBoundingClientRect();
    return {
      titleRight: title.right,
      promiseRight: promise.right,
      portraitLeft: portrait.left,
      portraitRight: portrait.right,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  expect(geometry.titleRight, '701×390 heading should clear portrait').toBeLessThanOrEqual(geometry.portraitLeft - 12);
  expect(geometry.promiseRight, '701×390 promise should clear portrait').toBeLessThanOrEqual(geometry.portraitLeft - 16);
  expect(geometry.portraitRight).toBeLessThanOrEqual(geometry.viewportWidth + .5);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

test('keeps About copy clear of the portrait at supported breakpoints', async ({ page }) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('[data-about-promise]')).toBeVisible();

    const { ledeBottom, promiseBottom, portraitTop } = await page.locator('.about').evaluate((scene) => {
      const sceneTop = scene.getBoundingClientRect().top;
      const lede = scene.querySelector('.about__lede')!.getBoundingClientRect();
      const promise = scene.querySelector('[data-about-promise]')!.getBoundingClientRect();
      const portrait = scene.querySelector('.about__portrait')!.getBoundingClientRect();
      return {
        ledeBottom: lede.bottom - sceneTop,
        promiseBottom: promise.bottom - sceneTop,
        portraitTop: portrait.top - sceneTop,
      };
    });

    expect(ledeBottom, `${width}px lede should clear portrait`).toBeLessThanOrEqual(portraitTop - 24);
    expect(promiseBottom, `${width}px promise should clear portrait`).toBeLessThanOrEqual(portraitTop - 24);
  }

  const desktopViewports = [
    { width: 701, height: 900 },
    { width: 768, height: 1024 },
    { width: 900, height: 900 },
    { width: 1024, height: 768 },
    { width: 1051, height: 900 },
    { width: 1100, height: 900 },
    { width: 1150, height: 900 },
    { width: 1199, height: 900 },
    { width: 1200, height: 900 },
    { width: 1280, height: 900 },
    { width: 1300, height: 900 },
    { width: 1366, height: 1024 },
    { width: 1366, height: 1200 },
    { width: 1403, height: 1200 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
  ] as const;

  for (const viewport of desktopViewports) {
    const { width, height } = viewport;
    const viewportLabel = `${width}x${height}`;
    await page.setViewportSize(viewport);
    await page.goto('/');

    await expect(page.locator('[data-about-promise]')).toBeVisible();
    const { titleRight, promiseRight, promiseBottom, portraitLeft, factsTop } = await page.locator('.about').evaluate((scene) => {
      const sceneLeft = scene.getBoundingClientRect().left;
      const sceneTop = scene.getBoundingClientRect().top;
      const titleText = scene.querySelector('#about-title')!.firstChild!;
      const range = document.createRange();
      range.selectNode(titleText);
      const promise = scene.querySelector('[data-about-promise]')!.getBoundingClientRect();
      return {
        titleRight: range.getBoundingClientRect().right - sceneLeft,
        promiseRight: promise.right - sceneLeft,
        promiseBottom: promise.bottom - sceneTop,
        portraitLeft: scene.querySelector('.about__portrait')!.getBoundingClientRect().left - sceneLeft,
        factsTop: scene.querySelector('.about__facts')!.getBoundingClientRect().top - sceneTop,
      };
    });

    expect(titleRight, `${viewportLabel} heading should clear portrait`).toBeLessThanOrEqual(portraitLeft - 12);
    expect(promiseRight, `${viewportLabel} promise should clear portrait`).toBeLessThanOrEqual(portraitLeft - 16);
    expect(promiseBottom, `${viewportLabel} promise should clear facts`).toBeLessThanOrEqual(factsTop - 16);
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
