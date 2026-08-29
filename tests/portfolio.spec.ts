import { expect, test, type Locator, type Page } from '@playwright/test';

const approvedScenes = ['hero', 'about', 'pivnoy-doner', 'driving-school', 'shaurma-mobile', 'telegram-shop', 'contact'];

const approvedProjects = [
  {
    id: 'pivnoy-doner',
    primary: 'desktop',
    action: { name: 'Открыть сайт', href: 'https://pivdoner.ru/' },
    shots: [
      { role: 'desktop', alt: 'Главная страница «Пивного Донера» на компьютере' },
      { role: 'mobile', alt: 'Главная страница «Пивного Донера» на телефоне' },
    ],
  },
  {
    id: 'driving-school',
    primary: 'mobile',
    action: { name: 'Открыть сайт', href: 'https://perekrestok-yaroslavl.netlify.app/' },
    shots: [
      { role: 'mobile', alt: 'Главная страница автошколы «Перекрёсток» на телефоне' },
      { role: 'desktop', alt: 'Главная страница автошколы «Перекрёсток» на компьютере' },
    ],
  },
  {
    id: 'shaurma-mobile',
    primary: 'mobile',
    action: { name: 'Открыть mobile-сайт', href: 'https://fastnightshadow-bit.github.io/chaurma/' },
    shots: [
      { role: 'mobile', alt: 'Главная страница «Шаурма Халяль 1» на телефоне' },
    ],
  },
  {
    id: 'telegram-shop',
    primary: 'mobile',
    action: { name: 'Запустить бота', href: 'https://t.me/veachelsell_bot' },
    shots: [
      { role: 'mobile', alt: 'Каталог Telegram-магазина VeachelSell' },
    ],
  },
] as const;

const proofViewports = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

const schoolHierarchyViewports = [
  { width: 390, height: 844 },
  { width: 700, height: 900 },
  { width: 701, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1199, height: 900 },
  { width: 1200, height: 900 },
  { width: 1440, height: 900 },
  { width: 1600, height: 1000 },
] as const;

const transitionViewports = [
  { width: 390, height: 844 },
  { width: 700, height: 900 },
  { width: 701, height: 900 },
  { width: 1440, height: 900 },
] as const;

const selectedTransitionContract = [
  ['ticker-to-about', 'hero', 'about'],
  ['personal-to-poster', 'about', 'pivnoy-doner'],
  ['clean-takeover', 'pivnoy-doner', 'driving-school'],
  ['road-to-phone', 'driving-school', 'shaurma-mobile'],
  ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
  ['message-to-contact', 'telegram-shop', 'contact'],
] as const;

const tickerTracks = [
  'ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ → ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ',
  'БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ → БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ',
  'ОТ ПЕРВОГО КЛИКА — К ПЕРВОЙ ПОЕЗДКЕ → ОТ ПЕРВОГО КЛИКА — К ПЕРВОЙ ПОЕЗДКЕ',
  'ROAD → MOBILE → MENU → ORDER → ROAD → MOBILE → MENU → ORDER',
  'WEB → CHAT → CATALOG → SHOP → WEB → CHAT → CATALOG → SHOP',
  'DESIGN × CODE × BUSINESS → DESIGN × CODE × BUSINESS',
] as const;

const tickerColors = [
  { background: 'rgb(17, 17, 22)', foreground: 'rgb(241, 238, 230)' },
  { background: 'rgb(17, 17, 22)', foreground: 'rgb(241, 238, 230)' },
  { background: 'rgb(56, 91, 245)', foreground: 'rgb(247, 243, 233)' },
  { background: 'rgb(255, 180, 56)', foreground: 'rgb(12, 12, 16)' },
  { background: 'rgb(213, 240, 235)', foreground: 'rgb(12, 12, 16)' },
  { background: 'rgb(17, 17, 22)', foreground: 'rgb(255, 85, 61)' },
] as const;

const tickerColorForViewport = (transition: string | null, viewportWidth: number, index: number) =>
  transition === 'road-to-phone' && viewportWidth <= 700
    ? { background: 'rgb(17, 17, 22)', foreground: 'rgb(241, 238, 230)' }
    : tickerColors[index];

const oldMockups = '.doner-poster, .school-road, .bot-phone, .school-sign';

async function expectImageLoaded(image: Locator, projectId: string, role: string) {
  await expect.poll(
    () => image.evaluate((element: HTMLImageElement) =>
      element.complete && Boolean(element.currentSrc) && element.naturalHeight > 0 && element.naturalWidth > 0,
    ),
    { message: `${projectId}/${role} should load a real responsive asset` },
  ).toBe(true);

  const loaded = await image.evaluate((element: HTMLImageElement) => ({
    currentSrc: element.currentSrc,
    naturalHeight: element.naturalHeight,
    naturalWidth: element.naturalWidth,
  }));
  expect(loaded.currentSrc, `${projectId}/${role} current source`).toMatch(
    new RegExp(`/assets/projects/${projectId}-${role}-(?:390|720|1280)\\.(?:avif|webp|jpg)$`),
  );
  expect(loaded.naturalWidth, `${projectId}/${role} natural width`).toBeGreaterThan(0);
  expect(loaded.naturalHeight, `${projectId}/${role} natural height`).toBeGreaterThan(0);
}

async function expectRealProjectProofs(page: Page, viewportWidth: number) {
  for (const project of approvedProjects) {
    const scene = page.locator(`[data-scene="${project.id}"]`);
    const media = scene.locator('[data-project-media]');
    const action = scene.locator('[data-project-action]');
    const shots = media.locator('[data-project-shot]');

    await expect(scene).toBeVisible();
    await expect(media).toBeVisible();
    await expect(media).toHaveClass(new RegExp(`\\bcase__media--primary-${project.primary}\\b`));
    await expect(shots).toHaveCount(project.shots.length);
    expect(await shots.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-project-shot')))).toEqual(
      project.shots.map(({ role }) => role),
    );
    await expect(shots.first()).toHaveClass(/\bproject-shot--primary\b/);

    await media.scrollIntoViewIfNeeded();
    for (const [index, expectedShot] of project.shots.entries()) {
      const shot = shots.nth(index);
      const image = shot.locator('img');
      await expect(image).toHaveAttribute('alt', expectedShot.alt);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('decoding', 'async');
      await expect(shot.locator('source')).toHaveCount(2);

      const isHiddenSchoolDesktop = project.id === 'driving-school' && expectedShot.role === 'desktop' && viewportWidth <= 700;
      if (isHiddenSchoolDesktop) {
        const projectAssetPath = `./assets/projects/${project.id}-${expectedShot.role}`;
        const sources = shot.locator('source');
        await expect(image).toHaveAttribute('src', `${projectAssetPath}-1280.jpg`);
        await expect(sources.nth(0)).toHaveAttribute(
          'srcset',
          `${projectAssetPath}-720.avif 720w, ${projectAssetPath}-1280.avif 1280w`,
        );
        await expect(sources.nth(1)).toHaveAttribute(
          'srcset',
          `${projectAssetPath}-720.webp 720w, ${projectAssetPath}-1280.webp 1280w`,
        );
        await expect(shot).toBeHidden();
        continue;
      }

      await expect(shot).toBeVisible();
      await expect(image).toBeVisible();
      await expectImageLoaded(image, project.id, expectedShot.role);

      const imageBox = await image.boundingBox();
      expect(imageBox, `${viewportWidth}px ${project.id}/${expectedShot.role} box`).not.toBeNull();
      expect(imageBox!.width, `${viewportWidth}px ${project.id}/${expectedShot.role} width`).toBeGreaterThan(44);
      expect(imageBox!.height, `${viewportWidth}px ${project.id}/${expectedShot.role} height`).toBeGreaterThan(44);
      expect(imageBox!.x, `${viewportWidth}px ${project.id}/${expectedShot.role} left edge`).toBeGreaterThanOrEqual(-0.5);
      expect(imageBox!.x + imageBox!.width, `${viewportWidth}px ${project.id}/${expectedShot.role} right edge`).toBeLessThanOrEqual(viewportWidth + 0.5);
    }

    await expect(action).toBeVisible();
    await expect(action).toHaveAccessibleName(project.action.name);
    await expect(action).toHaveAttribute('href', project.action.href);
    await expect(action).not.toHaveAttribute('target', /.+/);
    const actionBox = await action.boundingBox();
    expect(actionBox?.width, `${viewportWidth}px ${project.id} action width`).toBeGreaterThanOrEqual(44);
    expect(actionBox?.height, `${viewportWidth}px ${project.id} action height`).toBeGreaterThanOrEqual(44);
  }
}

test('story is ordered, readable, and has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Сайты, которые');
  expect(await page.locator('[data-scene]').evaluateAll((scenes) => scenes.map((scene) => scene.getAttribute('data-scene')))).toEqual(approvedScenes);
  await expect(page.locator('[data-transition]')).toHaveCount(6);
  const projects = page.locator('[data-project]');
  await expect(projects).toHaveCount(4);
  for (const project of await projects.all()) await expect(project).toBeVisible();
  await expect(page.locator('[data-project-media]')).toHaveCount(4);
  await expect(page.locator('[data-project-media] img')).toHaveCount(6);
  await expect(page.locator('[data-project-action]')).toHaveCount(4);
  await expect(page.locator('[data-github-link]')).toHaveCount(1);
  await expect(page.locator(oldMockups)).toHaveCount(0);

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

test('all handoffs are exact compact a14 running-text strips', async ({ page }) => {
  for (const viewport of transitionViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const transitions = page.locator('[data-transition]');
    await expect(transitions).toHaveCount(6);
    expect(await transitions.evaluateAll((elements) => elements.map((element) => [
      element.getAttribute('data-transition'),
      element.getAttribute('data-transition-from'),
      element.getAttribute('data-transition-to'),
    ]))).toEqual(selectedTransitionContract);

    expect(await transitions.locator('[data-transition-line]').allTextContents()).toEqual(tickerTracks);
    await expect(page.locator('[data-transition-stage], [data-transition-carrier], [data-transition-source], [data-transition-target], [data-transition-morph]')).toHaveCount(0);

    for (const [index, transition] of (await transitions.all()).entries()) {
      await transition.scrollIntoViewIfNeeded();
      const track = transition.locator('[data-transition-line]');
      await expect(track).toBeVisible();
      const metrics = await transition.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const track = element.querySelector<HTMLElement>('[data-transition-line]')!;
        const styles = getComputedStyle(track);
        return {
          background: getComputedStyle(element).backgroundColor,
          foreground: styles.color,
          height: bounds.height,
          overflow: getComputedStyle(element).overflow,
          whiteSpace: styles.whiteSpace,
          trackWidth: track.getBoundingClientRect().width,
        };
      });

      expect(Math.round(metrics.height), `${viewport.width}px transition ${index + 1} height`).toBe(viewport.width <= 700 ? 102 : 118);
      expect(
        { background: metrics.background, foreground: metrics.foreground },
        `${viewport.width}px transition ${index + 1} exact a14 colors`,
      ).toEqual(tickerColorForViewport(await transition.getAttribute('data-transition')!, viewport.width, index));
      expect(metrics.overflow, `${viewport.width}px transition ${index + 1} clipping`).toBe('hidden');
      expect(metrics.whiteSpace, `${viewport.width}px transition ${index + 1} nowrap`).toBe('nowrap');
      expect(metrics.trackWidth, `${viewport.width}px transition ${index + 1} running track`).toBeGreaterThan(viewport.width);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('every compact ticker track scrubs left as its strip crosses the viewport', async ({ page }) => {
  for (const viewport of transitionViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#app')).toHaveAttribute('data-motion-ready', '');

    for (const transition of await page.locator('[data-transition]').all()) {
      const track = transition.locator('[data-transition-line]');
      await transition.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + bounds.top - window.innerHeight * .9);
      });
      const before = await track.evaluate((element) => element.getBoundingClientRect().left);

      await transition.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + bounds.bottom - window.innerHeight * .2);
      });

      await expect.poll(() => track.evaluate((element) => element.getBoundingClientRect().left)).toBeLessThan(before - 8);
    }
  }
});

test('real project proofs load, stay visible, and expose approved actions at 390 and 1440', async ({ page }) => {
  for (const viewport of proofViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const heroGap = await page.locator('.hero').evaluate((hero) => {
      const paragraph = hero.querySelector('p')!.getBoundingClientRect();
      const button = hero.querySelector('.button')!.getBoundingClientRect();
      return button.top - paragraph.bottom;
    });
    expect(heroGap, `${viewport.width}px hero copy-to-CTA gap`).toBeGreaterThanOrEqual(24);

    await expectRealProjectProofs(page, viewport.width);

    const githubLink = page.locator('[data-github-link]');
    await githubLink.scrollIntoViewIfNeeded();
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAccessibleName('GitHub Ильи');
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/fastnightshadow-bit');
    await expect(githubLink).not.toHaveAttribute('target', /.+/);
    const githubBox = await githubLink.boundingBox();
    expect(githubBox?.width, `${viewport.width}px GitHub action width`).toBeGreaterThanOrEqual(44);
    expect(githubBox?.height, `${viewport.width}px GitHub action height`).toBeGreaterThanOrEqual(44);

    const compactProjectActions = page.locator('.case--mobile .case__action, .case--telegram .case__action');
    for (const action of await compactProjectActions.all()) {
      expect(
        await action.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
        `${viewport.width}px compact project CTA font size`,
      ).toBeGreaterThanOrEqual(10.5);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('Shaurma uses one bounded decorative detail to fill its tablet and desktop media area', async ({ page }) => {
  for (const viewport of [
    { width: 701, height: 900 },
    { width: 1440, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const scene = page.locator('[data-scene="shaurma-mobile"]');
    const media = scene.locator('[data-project-media]');
    const phone = media.locator('[data-project-shot="mobile"]');
    const detail = media.locator('[data-project-detail]');
    await media.scrollIntoViewIfNeeded();
    await expect(detail).toHaveCount(1);
    await expect(detail).toBeVisible();

    const geometry = await media.evaluate((element) => {
      const mediaBounds = element.getBoundingClientRect();
      const phoneBounds = element.querySelector<HTMLElement>('[data-project-shot="mobile"]')!.getBoundingClientRect();
      const detailBounds = element.querySelector<HTMLElement>('[data-project-detail]')!.getBoundingClientRect();
      const union = {
        left: Math.min(phoneBounds.left, detailBounds.left),
        top: Math.min(phoneBounds.top, detailBounds.top),
        right: Math.max(phoneBounds.right, detailBounds.right),
        bottom: Math.max(phoneBounds.bottom, detailBounds.bottom),
      };
      return {
        media: { left: mediaBounds.left, top: mediaBounds.top, right: mediaBounds.right, bottom: mediaBounds.bottom },
        phone: { left: phoneBounds.left, top: phoneBounds.top, right: phoneBounds.right, bottom: phoneBounds.bottom },
        detail: { left: detailBounds.left, top: detailBounds.top, right: detailBounds.right, bottom: detailBounds.bottom },
        footprint: ((union.right - union.left) * (union.bottom - union.top)) / (mediaBounds.width * mediaBounds.height),
      };
    });

    for (const [name, bounds] of [['phone', geometry.phone], ['detail', geometry.detail]] as const) {
      expect(bounds.left, `${viewport.width}px Shaurma ${name} left`).toBeGreaterThanOrEqual(geometry.media.left - .5);
      expect(bounds.top, `${viewport.width}px Shaurma ${name} top`).toBeGreaterThanOrEqual(geometry.media.top - .5);
      expect(bounds.right, `${viewport.width}px Shaurma ${name} right`).toBeLessThanOrEqual(geometry.media.right + .5);
      expect(bounds.bottom, `${viewport.width}px Shaurma ${name} bottom`).toBeLessThanOrEqual(geometry.media.bottom + .5);
    }
    expect(geometry.footprint, `${viewport.width}px Shaurma combined media footprint`).toBeGreaterThanOrEqual(.55);
    await expect(phone).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobileDetail = page.locator('[data-scene="shaurma-mobile"] [data-project-detail]');
  await expect(mobileDetail).toHaveCount(1);
  await expect(mobileDetail).toBeHidden();
  await expect(page.locator('[data-project-detail]')).toHaveCount(1);
  await expect(page.locator('[data-project-media] img')).toHaveCount(6);
});

test('AutoSchool keeps its mobile proof visually primary at every supported layout tier', async ({ page }) => {
  for (const viewport of schoolHierarchyViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const scene = page.locator('[data-scene="driving-school"]');
    const primary = scene.locator('[data-project-shot="mobile"]');
    const secondary = scene.locator('[data-project-shot="desktop"]');
    await primary.scrollIntoViewIfNeeded();
    await expect(primary).toBeVisible();
    if (viewport.width <= 700) {
      await expect(secondary).toBeHidden();
      continue;
    }

    await expect(secondary).toBeVisible();

    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();
    expect(primaryBox, `${viewport.width}px AutoSchool mobile box`).not.toBeNull();
    expect(secondaryBox, `${viewport.width}px AutoSchool desktop box`).not.toBeNull();
    expect(primaryBox!.height, `${viewport.width}px mobile proof height`).toBeGreaterThan(secondaryBox!.height);
    expect(
      primaryBox!.width * primaryBox!.height,
      `${viewport.width}px mobile proof visual area`,
    ).toBeGreaterThan(secondaryBox!.width * secondaryBox!.height);
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
    { bridge: 1, target: '[data-scene="pivnoy-doner"] [data-project-media]' },
    { bridge: 2, target: '[data-scene="driving-school"] [data-project-media]' },
    { bridge: 3, target: '[data-scene="shaurma-mobile"] [data-project-media]' },
    { bridge: 4, target: '[data-scene="telegram-shop"] [data-project-media]' },
    { bridge: 5, target: '[data-scene="contact"] h2', source: '[data-scene="telegram-shop"] [data-project-media]' },
  ] as const;

  const promiseLines = page.locator('[data-about-promise] .about__promise-line > span');
  await expect(promiseLines).toHaveCount(2);
  await expect(page.locator('.about__portrait img')).toHaveCSS('filter', /grayscale\(1\)/);
  await expect.poll(() => promiseLines.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeLessThan(0.2);
  for (const [index, handoff] of handoffs.entries()) {
    const bridge = page.locator('[data-transition]').nth(handoff.bridge);
    const target = page.locator(handoff.target);

    const targetBefore = await target.evaluate((element) => getComputedStyle(element).transform);
    const sourceSelector = 'source' in handoff ? handoff.source : undefined;
    const source = sourceSelector ? page.locator(sourceSelector) : undefined;
    const sourceBefore = source ? await source.evaluate((element) => getComputedStyle(element).transform) : undefined;

    await bridge.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight * 0.55);
    });

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

  const promotedLayers = await page.locator('[data-transition-line], [data-project] .case__copy, [data-project-media], [data-about-promise] .about__promise-line > span').evaluateAll(
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

  await expect(page.locator('[data-scene]')).toHaveCount(7);
  await expect(page.locator('[data-transition]')).toHaveCount(6);
  await expect(page.locator('[data-project]')).toHaveCount(4);
  await expect(page.locator('[data-project-media]')).toHaveCount(4);
  await expect(page.locator('[data-project-media] img')).toHaveCount(6);
  await expect(page.locator(oldMockups)).toHaveCount(0);
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
  for (const media of await page.locator('[data-project-media]').all()) {
    expect(await media.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBe(1);
    expect(await media.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  }
  await expectRealProjectProofs(page, page.viewportSize()!.width);
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
  await expect(page.locator('[data-github-link]')).toHaveAttribute('href', 'https://github.com/fastnightshadow-bit');
  for (const transition of await page.locator('[data-transition]').all()) {
    const track = transition.locator('[data-transition-line]');
    await expect(track).toBeVisible();
    const before = await track.evaluate((element) => getComputedStyle(element).transform);
    await transition.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(40);
    expect(await track.evaluate((element) => getComputedStyle(element).transform)).toBe(before);
  }
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

  await expect(page.locator('[data-scene]')).toHaveCount(7);
  await expect(page.locator('[data-transition]')).toHaveCount(6);
  await expect(page.locator('[data-project]')).toHaveCount(4);
  await expect(page.locator('[data-project-media]')).toHaveCount(4);
  await expect(page.locator('[data-project-media] img')).toHaveCount(6);
  for (const scene of await page.locator('[data-scene]').all()) await expect(scene).toBeVisible();
  await expect(page.locator('[data-transition-line]')).toHaveCount(6);
  expect(await page.locator('[data-transition-stage], [data-transition-carrier], [data-transition-source], [data-transition-target], [data-transition-morph]').count()).toBe(0);
  await expect(page.locator(`.bridge small, .about__scribble, ${oldMockups}`)).toHaveCount(0);
  for (const transition of await page.locator('[data-transition]').all()) {
    await expect(transition.locator('[data-transition-line]')).toBeVisible();
  }
  for (const copy of await page.locator('[data-project] .case__copy').all()) {
    expect(await copy.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBe(1);
    expect(await copy.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  }
  await expect(page.locator('[data-about-promise]')).toBeVisible();
  await expect(page.locator('[data-about-promise]')).toHaveText(/ОДИН ЧЕЛОВЕК\.\s*ВЕСЬ САЙТ\./);
  await expect(page.locator('.about__portrait img')).toHaveCSS('filter', /grayscale\(0\)/);
  await expectRealProjectProofs(page, expectedWidth);
  await expect(page.locator('[data-github-link]')).toHaveAccessibleName('GitHub Ильи');
  await expect(page.locator('[data-github-link]')).toHaveAttribute('href', 'https://github.com/fastnightshadow-bit');
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
