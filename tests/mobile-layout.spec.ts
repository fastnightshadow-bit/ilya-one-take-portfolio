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

const frozenTailPresentation = (page: Page) => page.evaluate(() => {
  const github = document.querySelector<HTMLElement>('.github-strip')!;
  const githubLink = github.querySelector<HTMLElement>('.github-strip__link')!;
  const finalBridge = document.querySelector<HTMLElement>('[data-transition="message-to-contact"]')!;
  const finalTrack = finalBridge.querySelector<HTMLElement>('[data-transition-line]')!;
  const contact = document.querySelector<HTMLElement>('[data-scene="contact"]')!;
  const contactTitle = contact.querySelector<HTMLElement>('h2')!;
  const contactButton = contact.querySelector<HTMLElement>('.button--contact')!;
  const githubStyles = getComputedStyle(github);
  const githubLinkStyles = getComputedStyle(githubLink);
  const finalBridgeStyles = getComputedStyle(finalBridge);
  const finalTrackStyles = getComputedStyle(finalTrack);
  const contactStyles = getComputedStyle(contact);
  const contactTitleStyles = getComputedStyle(contactTitle);
  const contactButtonStyles = getComputedStyle(contactButton);

  return {
    github: {
      columns: githubStyles.gridTemplateColumns.split(' ').length,
      gap: githubStyles.gap,
      background: githubStyles.backgroundColor,
      color: githubStyles.color,
      borderTopWidth: githubStyles.borderTopWidth,
      borderTopColor: githubStyles.borderTopColor,
      paddingInline: githubStyles.paddingLeft,
      height: github.getBoundingClientRect().height,
    },
    githubLink: {
      justifySelf: githubLinkStyles.justifySelf,
      minHeight: githubLinkStyles.minHeight,
      whiteSpace: githubLinkStyles.whiteSpace,
      letterSpacing: githubLinkStyles.letterSpacing,
      borderWidth: githubLinkStyles.borderTopWidth,
      width: githubLink.getBoundingClientRect().width,
      height: githubLink.getBoundingClientRect().height,
    },
    finalBridge: {
      background: finalBridgeStyles.backgroundColor,
      color: finalBridgeStyles.color,
      minHeight: finalBridgeStyles.minHeight,
      overflow: finalBridgeStyles.overflow,
      paddingInline: finalBridgeStyles.paddingLeft,
      height: finalBridge.getBoundingClientRect().height,
    },
    finalTrack: {
      color: finalTrackStyles.color,
      whiteSpace: finalTrackStyles.whiteSpace,
      fontSize: finalTrackStyles.fontSize,
      letterSpacing: finalTrackStyles.letterSpacing,
      width: finalTrack.getBoundingClientRect().width,
    },
    contact: {
      background: contactStyles.backgroundColor,
      color: contactStyles.color,
      minHeight: contactStyles.minHeight,
      overflow: contactStyles.overflow,
      paddingInline: contactStyles.paddingLeft,
      paddingBlock: contactStyles.paddingTop,
      height: contact.getBoundingClientRect().height,
    },
    contactTitle: {
      color: contactTitleStyles.color,
      fontSize: contactTitleStyles.fontSize,
      letterSpacing: contactTitleStyles.letterSpacing,
      textTransform: contactTitleStyles.textTransform,
      width: contactTitle.getBoundingClientRect().width,
    },
    contactButton: {
      background: contactButtonStyles.backgroundColor,
      color: contactButtonStyles.color,
      minHeight: contactButtonStyles.minHeight,
      borderWidth: contactButtonStyles.borderTopWidth,
      textTransform: contactButtonStyles.textTransform,
      width: contactButton.getBoundingClientRect().width,
      height: contactButton.getBoundingClientRect().height,
    },
  };
});

const projectGeometry = (page: Page, id: string) => page.locator(`[data-scene="${id}"]`).evaluate((scene) => {
  const chapter = scene.getBoundingClientRect();
  const copy = scene.querySelector<HTMLElement>('.case__copy')!.getBoundingClientRect();
  const media = scene.querySelector<HTMLElement>('[data-project-media]')!.getBoundingClientRect();
  return { chapter, copy, media };
});

test('mobile hero fills the usable screen and centers its copy intentionally', async ({ page }) => {
  for (const height of [664, 844]) {
    await page.setViewportSize({ width: 390, height });
    await page.goto('/');
    const metrics = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>('.site-header')!.getBoundingClientRect();
      const hero = document.querySelector<HTMLElement>('[data-scene="hero"]')!;
      const box = hero.getBoundingClientRect();
      const copy = hero.querySelector<HTMLElement>('.hero__copy')!.getBoundingClientRect();
      const title = hero.querySelector<HTMLElement>('h1')!;
      const authoredLineRights = [title.childNodes[0], title.childNodes[2]].map((node) => {
        const range = document.createRange();
        range.selectNodeContents(node!);
        return range.getBoundingClientRect().right;
      });
      const rotatingWordRight = title.querySelector<HTMLElement>('[data-rotating-word]')!.getBoundingClientRect().right;
      return {
        headerBottom: header.bottom,
        heroTop: box.top,
        heroBottom: box.bottom,
        heroHeight: box.height,
        usableHeight: innerHeight - header.height,
        display: getComputedStyle(hero).display,
        centerDelta: Math.abs((copy.top + copy.height / 2) - (box.top + box.height / 2)),
        contentRight: box.right - Number.parseFloat(getComputedStyle(hero).paddingRight),
        titleRight: Math.max(...authoredLineRights, rotatingWordRight),
        decorativeCount: hero.querySelectorAll('.scene__meta, .hero__ghost, .hero__scroll').length,
      };
    });
    expect(Math.abs(metrics.heroTop - metrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroHeight - metrics.usableHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroBottom - height)).toBeLessThanOrEqual(1);
    expect(metrics.display).toBe('grid');
    expect(metrics.centerDelta).toBeLessThanOrEqual(72);
    expect(metrics.titleRight).toBeLessThanOrEqual(metrics.contentRight + .5);
    expect(metrics.decorativeCount).toBe(0);
  }
});

test('mobile About stays in compact normal flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const metrics = await page.locator('[data-scene="about"]').evaluate((about) => {
    const bounds = about.getBoundingClientRect();
    const portrait = about.querySelector<HTMLElement>('.about__portrait')!;
    const copy = about.querySelector<HTMLElement>('.about__copy')!;
    return {
      height: bounds.height,
      columns: getComputedStyle(about).gridTemplateColumns.split(' ').length,
      portraitPosition: getComputedStyle(portrait).position,
      copyPosition: getComputedStyle(copy).position,
      portraitBottom: portrait.getBoundingClientRect().bottom,
      copyBottom: copy.getBoundingClientRect().bottom,
      aboutBottom: bounds.bottom,
      redundantFacts: about.querySelectorAll('.about__facts, [data-about-promise]').length,
    };
  });
  expect(metrics.height).toBeLessThan(850);
  expect(metrics.columns).toBe(2);
  expect(metrics.portraitPosition).not.toBe('absolute');
  expect(metrics.copyPosition).not.toBe('absolute');
  expect(metrics.portraitBottom).toBeLessThanOrEqual(metrics.aboutBottom + .5);
  expect(metrics.copyBottom).toBeLessThanOrEqual(metrics.aboutBottom + .5);
  expect(metrics.redundantFacts).toBe(0);
});

test('Doner is one large right-aligned phone at every compact width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 700, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const scene = page.locator('[data-scene="pivnoy-doner"]');
    const phone = scene.locator('[data-project-shot="mobile"]');
    await expect(phone).toBeVisible();
    await expect(scene.locator('[data-project-shot="desktop"]')).toBeHidden();
    await expect(scene.locator('[data-project-shot]:visible')).toHaveCount(1);

    const geometry = await scene.evaluate((element) => {
      const chapter = element.getBoundingClientRect();
      const copy = element.querySelector<HTMLElement>('.case__copy')!.getBoundingClientRect();
      const media = element.querySelector<HTMLElement>('[data-project-media]')!.getBoundingClientRect();
      const phone = element.querySelector<HTMLElement>('[data-project-shot="mobile"]')!;
      const phoneBounds = phone.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(phone).transform);
      const overlapWidth = Math.max(0, Math.min(copy.right, phoneBounds.right) - Math.max(copy.left, phoneBounds.left));
      const overlapHeight = Math.max(0, Math.min(copy.bottom, phoneBounds.bottom) - Math.max(copy.top, phoneBounds.top));
      return {
        chapter: { left: chapter.left, top: chapter.top, right: chapter.right, bottom: chapter.bottom },
        copy: { right: copy.right, bottom: copy.bottom },
        media: { right: media.right, width: media.width, height: media.height },
        phone: {
          left: phoneBounds.left,
          top: phoneBounds.top,
          right: phoneBounds.right,
          bottom: phoneBounds.bottom,
          width: phoneBounds.width,
          height: phoneBounds.height,
        },
        angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
        overlapArea: overlapWidth * overlapHeight,
      };
    });

    expect(geometry.angle, `${viewport.width}px Doner phone angle`).toBeGreaterThan(0);
    expect(geometry.overlapArea, `${viewport.width}px Doner copy/phone overlap`).toBe(0);
    if (viewport.width <= 360) {
      expect(geometry.copy.bottom, `${viewport.width}px Doner vertical separation`).toBeLessThanOrEqual(geometry.phone.top + .5);
    } else {
      expect(geometry.copy.right, `${viewport.width}px Doner horizontal separation`).toBeLessThanOrEqual(geometry.phone.left + .5);
    }
    expect(geometry.phone.left, `${viewport.width}px Doner phone left`).toBeGreaterThanOrEqual(geometry.chapter.left - .5);
    expect(geometry.phone.top, `${viewport.width}px Doner phone top`).toBeGreaterThanOrEqual(geometry.chapter.top - .5);
    expect(geometry.phone.right, `${viewport.width}px Doner phone right`).toBeLessThanOrEqual(geometry.chapter.right + .5);
    expect(geometry.phone.bottom, `${viewport.width}px Doner phone bottom`).toBeLessThanOrEqual(geometry.chapter.bottom + .5);
    expect(
      geometry.phone.width * geometry.phone.height / (geometry.media.width * geometry.media.height),
      `${viewport.width}px Doner phone media occupancy`,
    ).toBeGreaterThan(.45);
    expect(geometry.phone.height / geometry.media.height, `${viewport.width}px Doner phone media height`).toBeGreaterThan(.9);
    expect(Math.abs(geometry.phone.right - geometry.media.right), `${viewport.width}px Doner right alignment`).toBeLessThanOrEqual(4);
  }
});

test('Doner desktop proof returns above the compact breakpoint', async ({ page }) => {
  for (const viewport of [
    { width: 701, height: 900 },
    { width: 1440, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const scene = page.locator('[data-scene="pivnoy-doner"]');
    await expect(scene.locator('[data-project-shot="desktop"]')).toBeVisible();
    await expect(scene.locator('[data-project-shot="mobile"]')).toBeVisible();
  }
});

test('School shows one tilted phone beside centered copy and a styled action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const scene = page.locator('[data-scene="driving-school"]');
  const geometry = await projectGeometry(page, 'driving-school');
  const mobileProof = scene.locator('[data-project-shot="mobile"]');
  await expect(mobileProof).toBeVisible();
  const mobileAngle = await mobileProof.evaluate((shot) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(shot).transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  });
  expect(mobileAngle).toBeLessThan(0);
  await expect(scene.locator('[data-project-shot="desktop"]')).toBeHidden();
  expect(geometry.copy.right).toBeLessThanOrEqual(geometry.media.left);
  expect(Math.abs((geometry.copy.top + geometry.copy.height / 2) - (geometry.media.top + geometry.media.height / 2))).toBeLessThan(90);
  await expect(scene.locator('.case__action')).toHaveCSS('background-color', 'rgb(245, 207, 69)');
  await expect(scene.locator('.case__action')).not.toHaveCSS('box-shadow', 'none');
});

test('School phone stays inside its chapter at every compact width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 700, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const scene = page.locator('[data-scene="driving-school"]');
    const phone = scene.locator('[data-project-shot="mobile"]');
    const [sceneBox, phoneBox] = await Promise.all([scene.boundingBox(), phone.boundingBox()]);

    expect(sceneBox, `${viewport.width}px School chapter`).not.toBeNull();
    expect(phoneBox, `${viewport.width}px School phone`).not.toBeNull();
    expect(phoneBox!.x, `${viewport.width}px School phone left`).toBeGreaterThanOrEqual(sceneBox!.x - .5);
    expect(phoneBox!.y, `${viewport.width}px School phone top`).toBeGreaterThanOrEqual(sceneBox!.y - .5);
    expect(phoneBox!.x + phoneBox!.width, `${viewport.width}px School phone right`).toBeLessThanOrEqual(sceneBox!.x + sceneBox!.width + .5);
    expect(phoneBox!.y + phoneBox!.height, `${viewport.width}px School phone bottom`).toBeLessThanOrEqual(sceneBox!.y + sceneBox!.height + .5);
  }
});

test('Shaurma keeps two semantic headline runs clear of its authored phone', async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 700, height: 900 },
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const scene = page.locator('[data-scene="shaurma-mobile"]');
    const phone = scene.locator('[data-project-shot="mobile"]');
    await expect(scene.locator('[data-project-shot]')).toHaveCount(1);
    await expect(phone).toBeVisible();

    const presentation = await scene.evaluate((element) => {
      const copy = element.querySelector<HTMLElement>('.case__copy')!.getBoundingClientRect();
      const phone = element.querySelector<HTMLElement>('[data-project-shot="mobile"]')!;
      const phoneBounds = phone.getBoundingClientRect();
      const headline = element.querySelector<HTMLElement>('.case__headline')!;
      const first = document.createRange();
      first.selectNodeContents(headline.firstChild!);
      const accent = document.createRange();
      accent.selectNodeContents(headline.querySelector('.case__accent')!);
      const matrix = new DOMMatrixReadOnly(getComputedStyle(phone).transform);
      const overlapWidth = Math.max(0, Math.min(copy.right, phoneBounds.right) - Math.max(copy.left, phoneBounds.left));
      const overlapHeight = Math.max(0, Math.min(copy.bottom, phoneBounds.bottom) - Math.max(copy.top, phoneBounds.top));
      return {
        lines: { first: first.getClientRects().length, accent: accent.getClientRects().length },
        angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
        overlapArea: overlapWidth * overlapHeight,
      };
    });

    expect(presentation.lines, `${viewport.width}px Shaurma semantic runs`).toEqual({ first: 1, accent: 1 });
    expect(presentation.angle, `${viewport.width}px Shaurma authored angle`).toBeCloseTo(-1.5, 1);
    expect(presentation.overlapArea, `${viewport.width}px Shaurma copy/phone overlap`).toBe(0);
  }
});

test('School to Shaurma running text uses the requested black strip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const bridge = page.locator('[data-transition="road-to-phone"]');
  await expect(bridge).toHaveCSS('background-color', 'rgb(17, 17, 22)');
  await expect(bridge).toHaveCSS('color', 'rgb(241, 238, 230)');
});

const desktopProjectPresentation = (page: Page) => page.evaluate(() => {
  const rect = (element: Element) => {
    const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect();
    return { x, y, width, height, top, right, bottom, left };
  };
  const angle = (element: Element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  };

  const doner = document.querySelector<HTMLElement>('[data-scene="pivnoy-doner"]')!;
  const donerLayout = doner.querySelector<HTMLElement>('.case__layout')!;
  const donerCopy = doner.querySelector<HTMLElement>('.case__copy')!;
  const donerMedia = doner.querySelector<HTMLElement>('[data-project-media]')!;
  const school = document.querySelector<HTMLElement>('[data-scene="driving-school"]')!;
  const schoolLayout = school.querySelector<HTMLElement>('.case__layout')!;
  const schoolCopy = school.querySelector<HTMLElement>('.case__copy')!;
  const schoolMedia = school.querySelector<HTMLElement>('[data-project-media]')!;
  const schoolDesktop = school.querySelector<HTMLElement>('[data-project-shot="desktop"]')!;
  const schoolMobile = school.querySelector<HTMLElement>('[data-project-shot="mobile"]')!;
  const telegram = document.querySelector<HTMLElement>('[data-scene="telegram-shop"]')!;
  const telegramLayout = telegram.querySelector<HTMLElement>('.case__layout')!;
  const telegramMobile = telegram.querySelector<HTMLElement>('[data-project-shot="mobile"]')!;

  return {
    donerLayout: {
      columns: getComputedStyle(donerLayout).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(donerLayout).gap,
      rect: rect(donerLayout),
    },
    donerCopy: rect(donerCopy),
    donerMedia: {
      paddingTop: getComputedStyle(donerMedia).paddingTop,
      paddingRight: getComputedStyle(donerMedia).paddingRight,
      paddingBottom: getComputedStyle(donerMedia).paddingBottom,
      rect: rect(donerMedia),
    },
    schoolLayout: {
      columns: getComputedStyle(schoolLayout).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(schoolLayout).gap,
      rect: rect(schoolLayout),
    },
    schoolCopy: rect(schoolCopy),
    schoolMedia: {
      display: getComputedStyle(schoolMedia).display,
      paddingTop: getComputedStyle(schoolMedia).paddingTop,
      paddingRight: getComputedStyle(schoolMedia).paddingRight,
      paddingBottom: getComputedStyle(schoolMedia).paddingBottom,
      rect: rect(schoolMedia),
    },
    schoolDesktop: {
      boxShadow: getComputedStyle(schoolDesktop).boxShadow,
      borderTopWidth: getComputedStyle(schoolDesktop).borderTopWidth,
      rect: rect(schoolDesktop),
      angle: angle(schoolDesktop),
    },
    schoolMobile: {
      boxShadow: getComputedStyle(schoolMobile).boxShadow,
      borderTopWidth: getComputedStyle(schoolMobile).borderTopWidth,
      rect: rect(schoolMobile),
      angle: angle(schoolMobile),
    },
    telegram: {
      background: getComputedStyle(telegram).backgroundColor,
      paddingInline: getComputedStyle(telegram).paddingLeft,
      paddingBlock: getComputedStyle(telegram).paddingTop,
      rect: rect(telegram),
    },
    telegramLayout: {
      columns: getComputedStyle(telegramLayout).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(telegramLayout).gap,
      alignItems: getComputedStyle(telegramLayout).alignItems,
      rect: rect(telegramLayout),
    },
    telegramMobile: {
      boxShadow: getComputedStyle(telegramMobile).boxShadow,
      borderTopWidth: getComputedStyle(telegramMobile).borderTopWidth,
      rect: rect(telegramMobile),
      angle: angle(telegramMobile),
    },
  };
});

test('keeps the Telegram proof and cleaned final actions readable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const presentation = await telegramPresentation(page);
  const frozenTail = await frozenTailPresentation(page);

  expect({
    background: presentation.background,
    columns: presentation.columns,
    gap: presentation.gap,
    alignItems: presentation.alignItems,
    actionBackground: presentation.actionBackground,
    actionColor: presentation.actionColor,
    phoneShadow: presentation.phoneShadow,
  }).toEqual({
    background: 'rgb(213, 240, 235)',
    columns: 2,
    gap: '12px',
    alignItems: 'center',
    actionBackground: 'rgb(11, 87, 208)',
    actionColor: 'rgb(255, 255, 255)',
    phoneShadow: 'rgb(11, 87, 208) 9px 10px 0px 0px',
  });
  expect(presentation.headlineSize).toBeGreaterThanOrEqual(27);
  expect(presentation.headlineSize).toBeLessThanOrEqual(30);
  expect(presentation.phoneAngle).toBeCloseTo(1.5, 1);

  expect(frozenTail.github.columns).toBe(1);
  expect(frozenTail.github.background).toBe('rgb(12, 12, 16)');
  expect(frozenTail.github.color).toBe('rgb(241, 238, 230)');
  expect(frozenTail.githubLink.justifySelf).toBe('start');
  expect(Number.parseFloat(frozenTail.githubLink.minHeight)).toBeGreaterThanOrEqual(44);
  expect(frozenTail.githubLink.whiteSpace).toBe('nowrap');
  expect(frozenTail.githubLink.borderWidth).toBe('2px');
  expect(frozenTail.githubLink.width).toBeGreaterThan(120);
  expect(frozenTail.githubLink.height).toBeGreaterThanOrEqual(44);
  expect(frozenTail.finalBridge.background).toBe('rgb(17, 17, 22)');
  expect(frozenTail.finalBridge.overflow).toBe('hidden');
  expect(frozenTail.finalTrack.color).toBe('rgb(255, 85, 61)');
  expect(frozenTail.finalTrack.whiteSpace).toBe('nowrap');
  expect(frozenTail.finalBridge.height).toBe(102);
  expect(frozenTail.finalTrack.width).toBeGreaterThan(390);
  expect(frozenTail.contact.background).toBe('rgb(255, 85, 61)');
  expect(frozenTail.contact.color).toBe('rgb(12, 12, 16)');
  expect(frozenTail.contact.height).toBe(700);
  expect(frozenTail.contactTitle.textTransform).toBe('none');
  expect(frozenTail.contactTitle.width).toBeLessThanOrEqual(346);
  expect(frozenTail.contactButton.background).toBe('rgb(255, 255, 255)');
  expect(frozenTail.contactButton.textTransform).toBe('none');
  expect(frozenTail.contactButton.width).toBeGreaterThan(140);
  expect(frozenTail.contactButton.height).toBeGreaterThanOrEqual(44);
});

test('desktop project hierarchy remains balanced after mobile polish', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="desktop"]')).toBeVisible();
  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="mobile"]')).toBeVisible();

  const presentation = await desktopProjectPresentation(page);

  expect({
    donerLayout: {
      columns: presentation.donerLayout.columns,
      gap: presentation.donerLayout.gap,
    },
    donerMedia: {
      paddingTop: presentation.donerMedia.paddingTop,
      paddingRight: presentation.donerMedia.paddingRight,
      paddingBottom: presentation.donerMedia.paddingBottom,
    },
    schoolLayout: {
      columns: presentation.schoolLayout.columns,
      gap: presentation.schoolLayout.gap,
    },
    schoolMedia: {
      display: presentation.schoolMedia.display,
      paddingTop: presentation.schoolMedia.paddingTop,
      paddingRight: presentation.schoolMedia.paddingRight,
      paddingBottom: presentation.schoolMedia.paddingBottom,
    },
    schoolDesktop: {
      boxShadow: presentation.schoolDesktop.boxShadow,
      borderTopWidth: presentation.schoolDesktop.borderTopWidth,
    },
    schoolMobile: {
      boxShadow: presentation.schoolMobile.boxShadow,
      borderTopWidth: presentation.schoolMobile.borderTopWidth,
    },
    telegram: {
      background: presentation.telegram.background,
      paddingInline: presentation.telegram.paddingInline,
      paddingBlock: presentation.telegram.paddingBlock,
    },
    telegramLayout: {
      columns: presentation.telegramLayout.columns,
      gap: presentation.telegramLayout.gap,
      alignItems: presentation.telegramLayout.alignItems,
    },
    telegramMobile: {
      boxShadow: presentation.telegramMobile.boxShadow,
      borderTopWidth: presentation.telegramMobile.borderTopWidth,
    },
  }).toEqual({
    donerLayout: {
      columns: 2,
      gap: '79.2px',
    },
    donerMedia: {
      paddingTop: '16px',
      paddingRight: '57.6px',
      paddingBottom: '72px',
    },
    schoolLayout: {
      columns: 2,
      gap: '79.2px',
    },
    schoolMedia: {
      display: 'flex',
      paddingTop: '16px',
      paddingRight: '24px',
      paddingBottom: '24px',
    },
    schoolDesktop: {
      boxShadow: 'rgba(12, 12, 16, 0.2) 16px 16px 0px 0px',
      borderTopWidth: '3px',
    },
    schoolMobile: {
      boxShadow: 'rgba(12, 12, 16, 0.2) 14px 15px 0px 0px',
      borderTopWidth: '4px',
    },
    telegram: {
      background: 'rgb(213, 240, 235)',
      paddingInline: '34px',
      paddingBlock: '34px',
    },
    telegramLayout: {
      columns: 2,
      gap: '79.2px',
      alignItems: 'center',
    },
    telegramMobile: {
      boxShadow: 'rgb(11, 87, 208) 16px 18px 0px 0px',
      borderTopWidth: '4px',
    },
  });

  expect(presentation.donerLayout.rect.width).toBeGreaterThan(1300);
  expect(presentation.donerLayout.rect.height).toBeGreaterThan(700);
  expect(presentation.donerCopy.right).toBeLessThan(presentation.donerMedia.rect.left);
  expect(presentation.donerMedia.rect.width / presentation.donerLayout.rect.width).toBeGreaterThan(.5);

  expect(presentation.schoolLayout.rect.width).toBeGreaterThan(1300);
  expect(presentation.schoolLayout.rect.height).toBeGreaterThan(700);
  expect(presentation.schoolCopy.right).toBeLessThan(presentation.schoolMedia.rect.left);
  expect(presentation.schoolDesktop.rect.left).toBeGreaterThan(presentation.schoolMedia.rect.left);
  expect(presentation.schoolMobile.rect.left).toBeGreaterThanOrEqual(presentation.schoolMedia.rect.left);
  expect(presentation.schoolDesktop.rect.width).toBeGreaterThan(presentation.schoolMobile.rect.width);
  expect(presentation.schoolDesktop.rect.right).toBeLessThanOrEqual(presentation.schoolMedia.rect.right + .5);
  expect(presentation.schoolMobile.rect.bottom).toBeLessThanOrEqual(presentation.schoolMedia.rect.bottom + .5);
  expect(presentation.schoolDesktop.angle).toBeCloseTo(1, 2);
  expect(presentation.schoolMobile.angle).toBeCloseTo(-1, 2);

  expect(presentation.telegram.rect.width).toBe(1440);
  expect(presentation.telegram.rect.height).toBeGreaterThan(780);
  expect(presentation.telegramLayout.rect.width).toBeGreaterThan(1300);
  expect(presentation.telegramLayout.rect.height).toBeGreaterThan(700);
  expect(presentation.telegramMobile.rect.left).toBeGreaterThan(presentation.telegramLayout.rect.left + presentation.telegramLayout.rect.width / 2);
  expect(presentation.telegramMobile.rect.width).toBeGreaterThan(250);
  expect(presentation.telegramMobile.rect.right).toBeLessThanOrEqual(presentation.telegram.rect.right + .5);
  expect(presentation.telegramMobile.angle).toBeCloseTo(1.5, 2);
});
