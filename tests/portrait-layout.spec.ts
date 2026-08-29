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

  await page.locator('.hero__actions').getByRole('link', { name: 'Обо мне' }).click();
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
  const headerHeight = await page.locator('.site-header').evaluate((header) => header.getBoundingClientRect().height);
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveCSS('transform', 'none');
  await expect(portrait).toHaveCSS('opacity', '1');
  await expect(image).toHaveCSS('filter', 'none');
  expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const returnedTop = await expect.poll(() => portrait.evaluate((element) => element.getBoundingClientRect().top), {
    message: 'short-landscape portrait should return to its sticky top offset',
  });
  await returnedTop.toBeGreaterThanOrEqual(headerHeight - 1);
  await returnedTop.toBeLessThanOrEqual(headerHeight + 1);
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
    const sceneBounds = scene.getBoundingClientRect();
    const title = scene.querySelector('#about-title')!.getBoundingClientRect();
    const lede = scene.querySelector('.about__lede')!.getBoundingClientRect();
    const portrait = scene.querySelector('.about__portrait')!.getBoundingClientRect();
    const overlapWidth = Math.max(0, Math.min(title.right, portrait.right) - Math.max(title.left, portrait.left));
    const overlapHeight = Math.max(0, Math.min(title.bottom, portrait.bottom) - Math.max(title.top, portrait.top));
    return {
      titleRight: title.right,
      ledeRight: lede.right,
      copyBottom: scene.querySelector('.about__copy')!.getBoundingClientRect().bottom,
      portraitLeft: portrait.left,
      portraitRight: portrait.right,
      portraitBottom: portrait.bottom,
      sceneBottom: sceneBounds.bottom,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      overlapArea: overlapWidth * overlapHeight,
    };
  });

  expect(geometry.overlapArea, '701×390 heading should not overlap portrait').toBe(0);
  expect(geometry.titleRight, '701×390 heading should clear portrait').toBeLessThanOrEqual(geometry.portraitLeft - 12);
  expect(geometry.ledeRight, '701×390 description should clear portrait').toBeLessThanOrEqual(geometry.portraitLeft - 12);
  expect(geometry.copyBottom, '701×390 copy should stay within About').toBeLessThanOrEqual(geometry.sceneBottom + .5);
  expect(geometry.portraitBottom, '701×390 portrait should stay within About').toBeLessThanOrEqual(geometry.sceneBottom + .5);
  expect(geometry.portraitRight).toBeLessThanOrEqual(geometry.viewportWidth + .5);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

test('keeps the About title, description, and portrait readable and separate at supported breakpoints', async ({ page }) => {
  const viewports = [
    { width: 360, height: 900 },
    { width: 390, height: 900 },
    { width: 430, height: 900 },
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

  for (const viewport of viewports) {
    const { width, height } = viewport;
    const viewportLabel = `${width}x${height}`;
    await page.setViewportSize(viewport);
    await page.goto('/');

    const title = page.locator('#about-title');
    const lede = page.locator('.about__lede');
    const portrait = page.locator('.about__portrait');
    await expect(title).toBeVisible();
    await expect(lede).toBeVisible();
    await expect(portrait).toBeVisible();

    const geometry = await page.locator('.about').evaluate((scene) => {
      const sceneBounds = scene.getBoundingClientRect();
      const copyBounds = scene.querySelector('.about__copy')!.getBoundingClientRect();
      const titleElement = scene.querySelector<HTMLElement>('#about-title')!;
      const titleBounds = titleElement.getBoundingClientRect();
      const titleRange = document.createRange();
      titleRange.selectNodeContents(titleElement);
      const titleInk = titleRange.getBoundingClientRect();
      const ledeElement = scene.querySelector<HTMLElement>('.about__lede')!;
      const ledeBounds = ledeElement.getBoundingClientRect();
      const portraitBounds = scene.querySelector('.about__portrait')!.getBoundingClientRect();
      const titleStyle = getComputedStyle(titleElement);
      const ledeStyle = getComputedStyle(ledeElement);
      const overlap = (left: DOMRect, right: DOMRect) => {
        const overlapWidth = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
        const overlapHeight = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
        return overlapWidth * overlapHeight;
      };
      return {
        copyRight: copyBounds.right,
        copyBottom: copyBounds.bottom,
        titleRight: titleInk.right,
        titleScrollWidth: titleElement.scrollWidth,
        titleClientWidth: titleElement.clientWidth,
        titleFontSize: Number.parseFloat(titleStyle.fontSize),
        titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
        titleLetterSpacing: Number.parseFloat(titleStyle.letterSpacing),
        titlePortraitOverlap: overlap(titleBounds, portraitBounds),
        ledeRight: ledeBounds.right,
        ledeFontSize: Number.parseFloat(ledeStyle.fontSize),
        ledeLineHeight: Number.parseFloat(ledeStyle.lineHeight),
        ledePortraitOverlap: overlap(ledeBounds, portraitBounds),
        portraitLeft: portraitBounds.left,
        portraitRight: portraitBounds.right,
        portraitBottom: portraitBounds.bottom,
        sceneRight: sceneBounds.right,
        sceneBottom: sceneBounds.bottom,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    expect(geometry.titlePortraitOverlap, `${viewportLabel} heading should not overlap portrait`).toBe(0);
    expect(geometry.ledePortraitOverlap, `${viewportLabel} description should not overlap portrait`).toBe(0);
    expect(geometry.copyRight, `${viewportLabel} copy should stay left of portrait`).toBeLessThanOrEqual(geometry.portraitLeft - 12);
    expect(geometry.titleRight, `${viewportLabel} heading glyphs should clear portrait`).toBeLessThanOrEqual(geometry.portraitLeft - 12);
    expect(geometry.ledeRight, `${viewportLabel} description should clear portrait`).toBeLessThanOrEqual(geometry.portraitLeft - 12);
    expect(geometry.titleScrollWidth, `${viewportLabel} heading should wrap within its column`).toBeLessThanOrEqual(geometry.titleClientWidth + 1);
    expect(geometry.titleLineHeight, `${viewportLabel} heading lines should not collide`).toBeGreaterThanOrEqual(geometry.titleFontSize * .9);
    expect(geometry.titleLetterSpacing, `${viewportLabel} heading letters should remain distinguishable`).toBeGreaterThanOrEqual(geometry.titleFontSize * -.045);
    expect(geometry.ledeLineHeight, `${viewportLabel} description should have readable leading`).toBeGreaterThanOrEqual(geometry.ledeFontSize * 1.45);
    expect(geometry.copyBottom, `${viewportLabel} copy should stay within About`).toBeLessThanOrEqual(geometry.sceneBottom + .5);
    expect(geometry.portraitRight, `${viewportLabel} portrait should stay within About`).toBeLessThanOrEqual(geometry.sceneRight + .5);
    expect(geometry.portraitBottom, `${viewportLabel} portrait should stay within About`).toBeLessThanOrEqual(geometry.sceneBottom + .5);
    expect(geometry.documentWidth, `${viewportLabel} document should not overflow horizontally`).toBeLessThanOrEqual(geometry.viewportWidth);
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
