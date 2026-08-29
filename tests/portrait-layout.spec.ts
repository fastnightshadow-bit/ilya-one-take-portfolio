import { expect, test, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';

async function expectPortraitRasterPainted(page: Page, portrait: Locator, label: string) {
  const clip = await portrait.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const left = Math.max(0, bounds.left);
    const top = Math.max(0, bounds.top);
    const right = Math.min(window.innerWidth, bounds.right);
    const bottom = Math.min(window.innerHeight, bounds.bottom);
    return { x: left, y: top, width: right - left, height: bottom - top };
  });
  expect(clip.width, `${label} painted width`).toBeGreaterThan(80);
  expect(clip.height, `${label} painted height`).toBeGreaterThan(96);

  const screenshot = await page.screenshot({ clip });
  const stats = await sharp(screenshot).stats();
  expect(stats.entropy, `${label} raster entropy`).toBeGreaterThan(4);
  expect(Math.max(...stats.channels.slice(0, 3).map((channel) => channel.stdev)), `${label} raster deviation`).toBeGreaterThan(18);
}

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

test('keeps the clipped portrait out of a transformed compositor layer after scrolling away and back', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');

  const portrait = page.locator('.about__portrait');
  const image = portrait.locator('img');
  await image.evaluate((node) => (node as HTMLImageElement).decode());
  const documentBounds = await portrait.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      top: window.scrollY + bounds.top,
      bottom: window.scrollY + bounds.bottom,
    };
  });

  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), documentBounds.bottom - 12);
  await portrait.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().bottom - 8));
  const edgeBottom = await expect.poll(() => portrait.evaluate((element) => element.getBoundingClientRect().bottom), {
    message: 'portrait should leave only a small edge in the viewport',
  });
  await edgeBottom.toBeGreaterThanOrEqual(4);
  await edgeBottom.toBeLessThanOrEqual(12);

  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), documentBounds.top - 50);
  const returnedTop = await expect.poll(() => portrait.evaluate((element) => element.getBoundingClientRect().top), {
    message: 'portrait should return near the top of the viewport',
  });
  await returnedTop.toBeGreaterThanOrEqual(40);
  await returnedTop.toBeLessThanOrEqual(60);

  await expect(portrait).toHaveCSS('transform', 'none');
  await expect(portrait).toHaveCSS('opacity', '1');
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('filter', 'none');
  const decodedImage = await image.evaluate((node) => ({
    complete: (node as HTMLImageElement).complete,
    naturalWidth: (node as HTMLImageElement).naturalWidth,
  }));
  expect(decodedImage.complete).toBe(true);
  expect(decodedImage.naturalWidth).toBeGreaterThan(0);
  await expectPortraitRasterPainted(page, portrait, '390×844 portrait after reverse scroll');
});

test('keeps the short-landscape portrait paint layer stable after reverse scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1256, height: 542 });
  await page.goto('/');
  await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');

  const about = page.locator('.about');
  const portrait = about.locator('.about__portrait');
  const image = portrait.locator('img');
  await image.evaluate((node) => (node as HTMLImageElement).decode());
  const sceneBounds = await about.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      top: window.scrollY + bounds.top,
      bottom: window.scrollY + bounds.bottom,
    };
  });

  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), sceneBounds.bottom - 8);
  const edgeBottom = await expect.poll(() => about.evaluate((element) => element.getBoundingClientRect().bottom), {
    message: 'short-landscape About clip should leave only a small portrait edge in the viewport',
  });
  await edgeBottom.toBeGreaterThanOrEqual(4);
  await edgeBottom.toBeLessThanOrEqual(12);

  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), sceneBounds.top);
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveCSS('transform', 'none');
  await expect(portrait).toHaveCSS('opacity', '1');
  await expect(image).toHaveCSS('filter', 'none');
  expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const returnedTop = await expect.poll(() => portrait.evaluate((element) => element.getBoundingClientRect().top), {
    message: 'short-landscape portrait should return to its sticky top offset',
  });
  await returnedTop.toBeGreaterThanOrEqual(40);
  await returnedTop.toBeLessThanOrEqual(60);
  await expectPortraitRasterPainted(page, portrait, '1256×542 portrait after reverse scroll');
});

test('keeps most of the portrait visible through the bottom of About on short wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 1256, height: 542 });
  await page.goto('/');

  const portrait = page.locator('.about__portrait');
  await portrait.locator('img').evaluate((image) => (image as HTMLImageElement).decode());
  await page.locator('.process').evaluate((process) => {
    const processTop = window.scrollY + process.getBoundingClientRect().top;
    window.scrollTo(0, processTop - window.innerHeight);
  });

  await expect.poll(() => portrait.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
    return visibleHeight / bounds.height;
  }), { message: '1256×542 portrait visibility before the Process strip' }).toBeGreaterThanOrEqual(.65);
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

    const { copyRight, copyBottom, portraitLeft, portraitRight, portraitBottom, factsTop, factsBottom, sceneWidth, sceneHeight, overlapArea } = await page.locator('.about').evaluate((scene) => {
      const sceneBounds = scene.getBoundingClientRect();
      const copy = scene.querySelector('.about__copy')!.getBoundingClientRect();
      const sceneTop = scene.getBoundingClientRect().top;
      const portrait = scene.querySelector('.about__portrait')!.getBoundingClientRect();
      const facts = scene.querySelector('.about__facts')!.getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(copy.right, portrait.right) - Math.max(copy.left, portrait.left));
      const overlapHeight = Math.max(0, Math.min(copy.bottom, portrait.bottom) - Math.max(copy.top, portrait.top));
      return {
        copyRight: copy.right - sceneBounds.left,
        copyBottom: copy.bottom - sceneTop,
        portraitLeft: portrait.left - sceneBounds.left,
        portraitRight: portrait.right - sceneBounds.left,
        portraitBottom: portrait.bottom - sceneTop,
        factsTop: facts.top - sceneTop,
        factsBottom: facts.bottom - sceneTop,
        sceneWidth: sceneBounds.width,
        sceneHeight: sceneBounds.height,
        overlapArea: overlapWidth * overlapHeight,
      };
    });

    expect(overlapArea, `${width}px About copy and portrait should not overlap`).toBe(0);
    expect(copyRight, `${width}px About copy should stay left of the portrait`).toBeLessThanOrEqual(portraitLeft - 12);
    expect(copyBottom, `${width}px About copy should clear the facts row`).toBeLessThanOrEqual(factsTop - 16);
    expect(portraitBottom, `${width}px portrait should clear the facts row`).toBeLessThanOrEqual(factsTop - 16);
    expect(portraitRight, `${width}px portrait should stay within About`).toBeLessThanOrEqual(sceneWidth + .5);
    expect(factsBottom, `${width}px facts should stay within About`).toBeLessThanOrEqual(sceneHeight + .5);
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

test('selects the 720 portrait source for desktop Chromium at DPR 1 through 2560px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'DPR 1 source selection is covered by the desktop project');
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(1);

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const image = page.locator('.about__portrait img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((node) => (node as HTMLImageElement).decode());
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).currentSrc.endsWith('/assets/portrait/portrait-720.avif'))).toBe(true);

    await page.locator('.about__portrait source[type="image/avif"]').evaluate((source) => source.remove());
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).currentSrc.endsWith('/assets/portrait/portrait-720.webp'))).toBe(true);
  }
});

test('keeps the 1200 portrait source for mobile Chromium at DPR 3', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'DPR 3 source selection is covered by the mobile project');
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const image = page.locator('.about__portrait img');
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((node) => (node as HTMLImageElement).decode());
  await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).currentSrc.endsWith('/assets/portrait/portrait-1200.avif'))).toBe(true);
});
