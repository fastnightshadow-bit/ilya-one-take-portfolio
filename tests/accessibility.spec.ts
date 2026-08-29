import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const expectedLinks = [
  { name: 'ILYA / WEB DEVELOPER', href: '#top' },
  { name: '@girtopw ↗', href: 'https://t.me/girtopw' },
  { name: 'Смотреть дальше ↓', href: '#about' },
  { name: 'Открыть сайт', href: 'https://pivdoner.ru/' },
  { name: 'Открыть сайт', href: 'https://perekrestok-yaroslavl.netlify.app/' },
  { name: 'Открыть mobile-сайт', href: 'https://fastnightshadow-bit.github.io/chaurma/' },
  { name: 'Запустить бота', href: 'https://t.me/veachelsell_bot' },
  { name: 'GitHub Ильи', href: 'https://github.com/fastnightshadow-bit' },
  { name: 'Написать в Telegram →', href: 'https://t.me/girtopw' },
  { name: '@girtopw', href: 'https://t.me/girtopw' },
] as const;

const projectAlternatives = [
  { scene: 'pivnoy-doner', role: 'desktop', alt: 'Главная страница «Пивного Донера» на компьютере' },
  { scene: 'pivnoy-doner', role: 'mobile', alt: 'Главная страница «Пивного Донера» на телефоне' },
  { scene: 'driving-school', role: 'mobile', alt: 'Главная страница автошколы «Перекрёсток» на телефоне' },
  { scene: 'driving-school', role: 'desktop', alt: 'Главная страница автошколы «Перекрёсток» на компьютере' },
  { scene: 'shaurma-mobile', role: 'mobile', alt: 'Главная страница «Шаурма Халяль 1» на телефоне' },
  { scene: 'telegram-shop', role: 'mobile', alt: 'Каталог Telegram-магазина VeachelSell' },
] as const;

const requiredViewports = {
  mobile: [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ],
  desktop: [
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ],
} as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('exposes one banner, named navigation, and main landmark', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('complementary', { name: 'Код тоже можно посмотреть.' })).toHaveCount(1);
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

test('message-to-contact artwork keeps readable contact-word contrast against the coral message-field', async ({ page }) => {
  const finalTransition = page.locator('[data-transition="message-to-contact"]');
  expect(await finalTransition.count()).toBe(1);
  await finalTransition.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.bottom - window.innerHeight * .18);
  });
  await page.waitForTimeout(250);

  const contrast = await finalTransition.evaluate((transition) => {
    const channels = (color: string) => color.match(/[\d.]+/g)?.map(Number) ?? [];
    const luminance = (values: number[]) => {
      const normalized = values.slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
      });
      return .2126 * (normalized[0] ?? 0) + .7152 * (normalized[1] ?? 0) + .0722 * (normalized[2] ?? 0);
    };
    const word = transition.querySelector<HTMLElement>('[data-transition-target="contact-word"]')!;
    const field = transition.querySelector<HTMLElement>('[data-transition-morph="message-field"]')!;
    const foreground = channels(getComputedStyle(word).color);
    const background = channels(getComputedStyle(field).backgroundColor);
    const foregroundLuminance = luminance(foreground);
    const backgroundLuminance = luminance(background);
    return {
      backgroundAlpha: background[3] ?? 1,
      ratio: (Math.max(foregroundLuminance, backgroundLuminance) + .05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + .05),
    };
  });

  expect(contrast.backgroundAlpha).toBe(1);
  expect(contrast.ratio).toBeGreaterThanOrEqual(3);
});

test('portrait promise accent keeps readable contrast against the About background', async ({ page }) => {
  const contrast = await page.locator('[data-about-promise] .about__promise-line:last-child > span').evaluate((accent) => {
    const channels = (color: string) => color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    const luminance = (color: string) => {
      const normalized = channels(color).map((channel) => {
        const value = channel / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
      });
      return .2126 * (normalized[0] ?? 0) + .7152 * (normalized[1] ?? 0) + .0722 * (normalized[2] ?? 0);
    };
    const foreground = luminance(getComputedStyle(accent).color);
    const background = luminance(getComputedStyle(accent.closest('.about')!).backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });

  expect(contrast).toBeGreaterThanOrEqual(3);
});

test('keyboard traversal keeps every complete focus ring visible at required viewports', async ({ page }, testInfo) => {
  const viewports = requiredViewports[testInfo.project.name as keyof typeof requiredViewports];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    for (const expectedLink of expectedLinks) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus-visible');
      await expect(focused).toHaveAccessibleName(expectedLink.name);
      await expect(focused).toBeVisible();

      await expect.poll(() => focused.evaluate((element) => {
        const styles = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const ringExpansion = Number.parseFloat(styles.outlineWidth) + Number.parseFloat(styles.outlineOffset);
        return bounds.bottom + ringExpansion;
      }), { message: `${viewport.width}×${viewport.height} ${expectedLink.name} focus ring bottom` }).toBeLessThanOrEqual(viewport.height);

      const focusMetrics = await focused.evaluate((element) => {
        const colorChannels = (color: string) => color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
        const luminance = (color: string) => {
          const normalized = colorChannels(color).map((channel) => {
            const value = channel / 255;
            return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
          });
          return .2126 * (normalized[0] ?? 0) + .7152 * (normalized[1] ?? 0) + .0722 * (normalized[2] ?? 0);
        };
        const styles = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const stickyHeader = document.querySelector('.site-header')!.getBoundingClientRect();
        const outlineWidth = Number.parseFloat(styles.outlineWidth);
        const outlineOffset = Number.parseFloat(styles.outlineOffset);
        const ringExpansion = outlineWidth + outlineOffset;
        const contact = element.closest<HTMLElement>('.contact');
        const contactBackground = contact ? getComputedStyle(contact).backgroundColor : undefined;
        const outlineLuminance = luminance(styles.outlineColor);
        const backgroundLuminance = contactBackground ? luminance(contactBackground) : undefined;
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth,
          outlineOffset,
          outlineColor: styles.outlineColor,
          contactContrast: backgroundLuminance === undefined
            ? undefined
            : (Math.max(outlineLuminance, backgroundLuminance) + .05) / (Math.min(outlineLuminance, backgroundLuminance) + .05),
          withinHeader: element.closest('.site-header') !== null,
          ringTop: bounds.top - ringExpansion,
          ringRight: bounds.right + ringExpansion,
          ringBottom: bounds.bottom + ringExpansion,
          ringLeft: bounds.left - ringExpansion,
          headerBottom: stickyHeader.bottom,
        };
      });

      expect(focusMetrics.outlineStyle).not.toBe('none');
      expect(focusMetrics.outlineWidth).toBeGreaterThanOrEqual(3);
      if (expectedLink.name === 'Написать в Telegram →' || expectedLink.name === '@girtopw') {
        expect(focusMetrics.contactContrast, `${expectedLink.name} outline ${focusMetrics.outlineColor} contrast`).toBeGreaterThanOrEqual(3);
      }
      expect(focusMetrics.ringTop, `${viewport.width}×${viewport.height} ${expectedLink.name} ring top`).toBeGreaterThanOrEqual(0);
      expect(focusMetrics.ringRight, `${viewport.width}×${viewport.height} ${expectedLink.name} ring right`).toBeLessThanOrEqual(viewport.width);
      expect(focusMetrics.ringBottom, `${viewport.width}×${viewport.height} ${expectedLink.name} ring bottom`).toBeLessThanOrEqual(viewport.height);
      expect(focusMetrics.ringLeft, `${viewport.width}×${viewport.height} ${expectedLink.name} ring left`).toBeGreaterThanOrEqual(0);
      if (!focusMetrics.withinHeader) expect(focusMetrics.ringTop).toBeGreaterThanOrEqual(focusMetrics.headerBottom + 4);
    }
  }
});

test('keyboard activation scrolls the About target clear of the sticky header', async ({ page }, testInfo) => {
  const viewports = requiredViewports[testInfo.project.name as keyof typeof requiredViewports];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const aboutLink = page.locator(':focus-visible');
    await expect(aboutLink).toHaveAccessibleName('Смотреть дальше ↓');

    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#about');
    await expect.poll(() => page.evaluate(() => {
      const headerBottom = document.querySelector('.site-header')!.getBoundingClientRect().bottom;
      return document.querySelector('#about')!.getBoundingClientRect().top - headerBottom;
    })).toBeLessThanOrEqual(40);

    const geometry = await page.evaluate(() => {
      const headerBottom = document.querySelector('.site-header')!.getBoundingClientRect().bottom;
      return {
        headerBottom,
        targetTop: document.querySelector('#about')!.getBoundingClientRect().top,
        metaTop: document.querySelector('#about .scene__meta')!.getBoundingClientRect().top,
      };
    });

    expect(geometry.targetTop - geometry.headerBottom, `${viewport.width}×${viewport.height} target gap`).toBeGreaterThanOrEqual(12);
    expect(geometry.metaTop - geometry.headerBottom, `${viewport.width}×${viewport.height} meta gap`).toBeGreaterThanOrEqual(12);
  }
});

test('portrait and six real project screenshots expose meaningful alternatives while selected transitions stay decorative', async ({ page }) => {
  await expect(page.locator('.about__portrait img')).toHaveAttribute('alt', 'Илья, веб-разработчик');
  const promise = page.locator('[data-about-promise]');
  await expect(promise).toBeVisible();
  await expect(promise).toHaveText(/ОДИН ЧЕЛОВЕК\.\s*ВЕСЬ САЙТ\./);
  await expect(promise).not.toHaveAttribute('aria-hidden', /.+/);

  const images = page.locator('[data-project-media] img');
  await expect(images).toHaveCount(6);
  for (const expectedImage of projectAlternatives) {
    const image = page.locator(
      `[data-scene="${expectedImage.scene}"] [data-project-shot="${expectedImage.role}"] img`,
    );
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('alt', expectedImage.alt);
    await expect(image).not.toHaveAttribute('aria-hidden', /.+/);
  }

  const schoolShots = page.locator('[data-scene="driving-school"] [data-project-shot]');
  expect(await schoolShots.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-project-shot')))).toEqual(['mobile', 'desktop']);
  await expect(schoolShots.first()).toHaveClass(/\bproject-shot--primary\b/);

  const transitions = page.locator('[data-transition]');
  await expect(transitions).toHaveCount(6);
  expect(await transitions.evaluateAll((elements) => elements.map((element) => [
    element.getAttribute('data-transition'),
    element.getAttribute('data-transition-from'),
    element.getAttribute('data-transition-to'),
  ]))).toEqual([
    ['ticker-to-about', 'hero', 'about'],
    ['personal-to-poster', 'about', 'pivnoy-doner'],
    ['clean-takeover', 'pivnoy-doner', 'driving-school'],
    ['road-to-phone', 'driving-school', 'shaurma-mobile'],
    ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
    ['message-to-contact', 'telegram-shop', 'contact'],
  ]);
  for (const transition of await transitions.all()) {
    await expect(transition).toHaveAttribute('aria-hidden', 'true');
    await expect(transition.locator('[data-transition-copy], .bridge__copy')).toHaveCount(0);
    await expect(transition.locator('[data-transition-source]')).toHaveCount(1);
    await expect(transition.locator('[data-transition-target]')).toHaveCount(1);
    await expect(transition.locator('[data-transition-morph]')).toHaveCount(1);
    await expect(transition.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0);
  }
  await expect(page.locator('.doner-poster, .school-road, .bot-phone, .school-sign')).toHaveCount(0);
});
