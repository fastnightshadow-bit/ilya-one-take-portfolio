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

test('clean compositions keep the hero CTA and school road deliberately placed', async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 900 },
    { width: 701, height: 900 },
    { width: 768, height: 1024 },
    { width: 900, height: 900 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1051, height: 900 },
    { width: 1100, height: 900 },
    { width: 1150, height: 900 },
    { width: 1199, height: 900 },
    { width: 1200, height: 900 },
    { width: 1440, height: 900 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const heroGap = await page.locator('.hero').evaluate((hero) => {
      const paragraph = hero.querySelector('p')!.getBoundingClientRect();
      const button = hero.querySelector('.button')!.getBoundingClientRect();
      return button.top - paragraph.bottom;
    });
    expect(heroGap, `${viewport.width}px hero copy-to-CTA gap`).toBeGreaterThanOrEqual(24);

    const roadGeometry = await page.locator('.case--school').evaluate((school) => {
      const scene = school.getBoundingClientRect();
      const road = school.querySelector('.school-road')!.getBoundingClientRect();
      const headline = school.querySelector('.case__headline')!.getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(road.right, headline.right) - Math.max(road.left, headline.left));
      const overlapHeight = Math.max(0, Math.min(road.bottom, headline.bottom) - Math.max(road.top, headline.top));
      return {
        left: road.left - scene.left,
        top: road.top - scene.top,
        right: scene.right - road.right,
        bottom: scene.bottom - road.bottom,
        headlineOverlap: overlapWidth * overlapHeight,
      };
    });
    expect(roadGeometry.left, `${viewport.width}px road left`).toBeGreaterThanOrEqual(0);
    expect(roadGeometry.top, `${viewport.width}px road top`).toBeGreaterThanOrEqual(0);
    expect(roadGeometry.right, `${viewport.width}px road right`).toBeGreaterThanOrEqual(0);
    expect(roadGeometry.bottom, `${viewport.width}px road bottom`).toBeGreaterThanOrEqual(0);
    expect(roadGeometry.headlineOverlap, `${viewport.width}px road/headline overlap`).toBe(0);
  }
});

test('theme-aware story handoffs progress without shifting the rotating hero word', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-motion-ready', '');

  const fallback = page.locator('[data-hero-fallback]');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Сайты, которые цепляют. продают. помнят.');
  await expect(fallback).toHaveCSS('position', 'absolute');
  const rotatingWord = page.locator('[data-rotating-word]');
  await expect(rotatingWord).toBeVisible();
  const firstWord = await rotatingWord.textContent();
  const firstWidth = await rotatingWord.evaluate((element) => element.getBoundingClientRect().width);
  await expect.poll(() => rotatingWord.textContent()).not.toBe(firstWord);
  const secondWidth = await rotatingWord.evaluate((element) => element.getBoundingClientRect().width);
  expect(Math.abs(secondWidth - firstWidth)).toBeLessThanOrEqual(0.5);

  const handoffs = [
    { bridge: 0, target: '.about__portrait' },
    { bridge: 1, target: '.doner-poster' },
    { bridge: 2, target: '.school-road' },
    { bridge: 3, target: '.bot-phone' },
    { bridge: 4, target: '[data-scene="contact"] h2', source: '.case--telegram .bot-phone' },
  ] as const;

  const promiseLines = page.locator('[data-about-promise] .about__promise-line > span');
  await expect(promiseLines).toHaveCount(2);
  await expect(page.locator('.about__portrait img')).toHaveCSS('filter', /grayscale\(1\)/);
  await expect.poll(() => promiseLines.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeLessThan(0.2);
  for (const [index, handoff] of handoffs.entries()) {
    const bridge = page.locator('[data-transition]').nth(handoff.bridge);
    const phrase = bridge.locator('strong');
    const target = page.locator(handoff.target);

    const phraseBefore = await phrase.evaluate((element) => getComputedStyle(element).transform);
    const targetBefore = await target.evaluate((element) => getComputedStyle(element).transform);
    const sourceSelector = 'source' in handoff ? handoff.source : undefined;
    const source = sourceSelector ? page.locator(sourceSelector) : undefined;
    const sourceBefore = source ? await source.evaluate((element) => getComputedStyle(element).transform) : undefined;

    await bridge.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight * 0.55);
    });

    await expect.poll(() => phrase.evaluate((element) => getComputedStyle(element).transform)).not.toBe(phraseBefore);
    await expect.poll(() => target.evaluate((element) => getComputedStyle(element).transform)).not.toBe(targetBefore);
    if (source && sourceBefore !== undefined) {
      await expect.poll(() => source.evaluate((element) => getComputedStyle(element).transform)).not.toBe(sourceBefore);
    }

    if (index === 0) {
      await page.locator('.about').evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight * 0.3);
      });
      await expect.poll(() => promiseLines.last().evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
      await expect.poll(() => promiseLines.evaluateAll((elements) => Math.max(...elements.map((element) => {
        const line = element.parentElement!.getBoundingClientRect();
        const inner = element.getBoundingClientRect();
        return Math.abs(inner.top - line.top);
      })))).toBeLessThanOrEqual(1);
      await expect.poll(() => page.locator('.about__portrait img').evaluate((element) => getComputedStyle(element).filter)).toContain('grayscale(0)');
    }

    if (index === 1) {
      const project = page.locator('[data-project]').first();
      const caseCopy = project.locator('.case__copy');
      await project.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + bounds.top - window.innerHeight * 0.2);
      });
      await expect.poll(() => caseCopy.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
      await expect.poll(() => caseCopy.evaluate((element) => getComputedStyle(element).transform)).toMatch(/matrix\([^)]*, 0\)$/);
    }
  }

  const promotedLayers = await page.locator('[data-transition] strong, [data-project] .case__copy, [data-about-promise] .about__promise-line > span').evaluateAll(
    (elements) => elements.filter((element) => getComputedStyle(element).willChange !== 'auto').length,
  );
  expect(promotedLayers).toBe(0);

  expect(errors).toEqual([]);
});

test('reduced motion keeps final compositions visible and static', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('[data-project]')).toHaveCount(3);
  await expect(page.locator('[data-scene="contact"]')).toBeVisible();
  await expect(page.locator('#app')).not.toHaveAttribute('data-motion-ready', '');
  const fallback = page.locator('[data-hero-fallback]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText('цепляют.');
  await expect(fallback).toContainText('продают.');
  await expect(fallback).toContainText('помнят.');
  for (const copy of await page.locator('[data-project] .case__copy').all()) {
    expect(await copy.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBe(1);
    expect(await copy.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  }
  const promise = page.locator('[data-about-promise]');
  await expect(promise).toBeVisible();
  await expect(promise).toHaveText(/ОДИН ЧЕЛОВЕК\.\s*ВЕСЬ САЙТ\./);
  for (const line of await promise.locator('.about__promise-line > span').all()) {
    await expect(line).toHaveCSS('opacity', '1');
    await expect(line).toHaveCSS('transform', 'none');
  }
  await expect(page.locator('.about__portrait img')).toHaveCSS('filter', /grayscale\(0\)/);
  const word = page.locator('[data-rotating-word]');
  await expect(word).toBeHidden();
  const staticWord = await word.textContent();
  await page.waitForTimeout(2100);
  await expect(word).toHaveText(staticWord ?? '');
  expect(errors).toEqual([]);
});

test('styled static story remains complete when the application script fails', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const abortedScripts: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'script') {
      await route.continue();
      return;
    }
    abortedScripts.push(route.request().url());
    await route.abort();
  });
  await page.goto('/');

  const expectedWidth = testInfo.project.name === 'mobile' ? 390 : 1440;
  expect(page.viewportSize()?.width).toBe(expectedWidth);
  expect(await page.evaluate(() => window.innerWidth)).toBe(expectedWidth);
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.styleSheets.length)).toBeGreaterThanOrEqual(1);
  await expect(page.locator('[data-scene="hero"]')).toHaveCSS('background-color', 'rgb(12, 12, 16)');
  await expect(page.locator('[data-scene="about"]')).toHaveCSS('background-color', 'rgb(241, 238, 230)');
  const fallback = page.locator('[data-hero-fallback]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText('цепляют.');
  await expect(fallback).toContainText('продают.');
  await expect(fallback).toContainText('помнят.');
  await expect(page.locator('[data-rotating-word]')).toBeHidden();

  await expect(page.locator('[data-scene]')).toHaveCount(6);
  await expect(page.locator('[data-project]')).toHaveCount(3);
  for (const scene of await page.locator('[data-scene]').all()) await expect(scene).toBeVisible();
  await expect(page.locator('[data-transition-carrier], .bridge small, .about__scribble, .school-sign')).toHaveCount(0);
  for (const copy of await page.locator('[data-project] .case__copy').all()) {
    expect(await copy.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBe(1);
    expect(await copy.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  }
  await expect(page.locator('[data-about-promise]')).toBeVisible();
  await expect(page.locator('[data-about-promise]')).toHaveText(/ОДИН ЧЕЛОВЕК\.\s*ВЕСЬ САЙТ\./);
  await expect(page.locator('.about__portrait img')).toHaveCSS('filter', /grayscale\(0\)/);
  await expect(page.locator('[data-primary-cta]').last()).toHaveAttribute('href', 'https://t.me/girtopw');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(abortedScripts.length).toBeGreaterThanOrEqual(1);
  const expectedAbortError = 'Failed to load resource: net::ERR_FAILED';
  expect(errors.filter((message) => message === expectedAbortError)).toHaveLength(abortedScripts.length);
  expect(errors.filter((message) => message !== expectedAbortError)).toEqual([]);
});

test('all primary CTAs use the approved safe Telegram destination without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  await page.goto('/');
  const links = page.locator('[data-primary-cta]');
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', 'https://t.me/girtopw');
    await expect(link).not.toHaveAttribute('target', /.+/);
    const bounds = await link.boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator('.contact__handle')).toHaveAccessibleName('@girtopw');
  expect(errors).toEqual([]);
});

test('supported mobile, landscape, tablet, and desktop geometries do not overflow or hide either final CTA', async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const geometry = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    expect(geometry.documentWidth, `${viewport.width}×${viewport.height} document width`).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.bodyWidth, `${viewport.width}×${viewport.height} body width`).toBeLessThanOrEqual(geometry.viewportWidth);

    const finalCtas = page.locator('[data-scene="contact"] [data-primary-cta]');
    await expect(finalCtas).toHaveCount(2);
    for (const finalCta of await finalCtas.all()) {
      await finalCta.scrollIntoViewIfNeeded();
      await expect(finalCta, `${viewport.width}×${viewport.height} final CTA`).toBeVisible();
      const ctaBox = await finalCta.boundingBox();
      expect(ctaBox!.x).toBeGreaterThanOrEqual(0);
      expect(ctaBox!.x + ctaBox!.width).toBeLessThanOrEqual(viewport.width);
    }
  }
});
