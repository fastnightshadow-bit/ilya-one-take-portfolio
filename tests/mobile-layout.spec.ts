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

test('published Telegram mobile presentation and frozen post-Telegram tail remain unchanged', async ({ page }) => {
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

  expect({
    github: {
      columns: frozenTail.github.columns,
      gap: frozenTail.github.gap,
      background: frozenTail.github.background,
      color: frozenTail.github.color,
      borderTopWidth: frozenTail.github.borderTopWidth,
      borderTopColor: frozenTail.github.borderTopColor,
      paddingInline: frozenTail.github.paddingInline,
    },
    githubLink: {
      justifySelf: frozenTail.githubLink.justifySelf,
      minHeight: frozenTail.githubLink.minHeight,
      whiteSpace: frozenTail.githubLink.whiteSpace,
      letterSpacing: frozenTail.githubLink.letterSpacing,
      borderWidth: frozenTail.githubLink.borderWidth,
    },
    finalBridge: {
      background: frozenTail.finalBridge.background,
      color: frozenTail.finalBridge.color,
      minHeight: frozenTail.finalBridge.minHeight,
      overflow: frozenTail.finalBridge.overflow,
      paddingInline: frozenTail.finalBridge.paddingInline,
    },
    finalTrack: {
      color: frozenTail.finalTrack.color,
      whiteSpace: frozenTail.finalTrack.whiteSpace,
      fontSize: frozenTail.finalTrack.fontSize,
      letterSpacing: frozenTail.finalTrack.letterSpacing,
    },
    contact: {
      background: frozenTail.contact.background,
      color: frozenTail.contact.color,
      minHeight: frozenTail.contact.minHeight,
      overflow: frozenTail.contact.overflow,
      paddingInline: frozenTail.contact.paddingInline,
      paddingBlock: frozenTail.contact.paddingBlock,
    },
    contactTitle: {
      color: frozenTail.contactTitle.color,
      fontSize: frozenTail.contactTitle.fontSize,
      letterSpacing: frozenTail.contactTitle.letterSpacing,
      textTransform: frozenTail.contactTitle.textTransform,
    },
    contactButton: {
      background: frozenTail.contactButton.background,
      color: frozenTail.contactButton.color,
      minHeight: frozenTail.contactButton.minHeight,
      borderWidth: frozenTail.contactButton.borderWidth,
      textTransform: frozenTail.contactButton.textTransform,
    },
  }).toEqual({
    github: {
      columns: 1,
      gap: '24px',
      background: 'rgb(12, 12, 16)',
      color: 'rgb(241, 238, 230)',
      borderTopWidth: '1px',
      borderTopColor: 'rgb(48, 48, 56)',
      paddingInline: '22px',
    },
    githubLink: {
      justifySelf: 'start',
      minHeight: '44px',
      whiteSpace: 'nowrap',
      letterSpacing: '0.56px',
      borderWidth: '2px',
    },
    finalBridge: {
      background: 'rgb(17, 17, 22)',
      color: 'rgb(241, 238, 230)',
      minHeight: '102px',
      overflow: 'hidden',
      paddingInline: '22px',
    },
    finalTrack: {
      color: 'rgb(255, 85, 61)',
      whiteSpace: 'nowrap',
      fontSize: '32px',
      letterSpacing: '-1.92px',
    },
    contact: {
      background: 'rgb(255, 85, 61)',
      color: 'rgb(12, 12, 16)',
      minHeight: '700px',
      overflow: 'clip',
      paddingInline: '22px',
      paddingBlock: '22px',
    },
    contactTitle: {
      color: 'rgb(12, 12, 16)',
      fontSize: '81.9px',
      letterSpacing: '-2.8665px',
      textTransform: 'uppercase',
    },
    contactButton: {
      background: 'rgb(255, 255, 255)',
      color: 'rgb(12, 12, 16)',
      minHeight: '44px',
      borderWidth: '2px',
      textTransform: 'uppercase',
    },
  });

  expect(frozenTail.github.height).toBeCloseTo(260.3125, 3);
  expect(frozenTail.githubLink.width).toBeCloseTo(150.078125, 3);
  expect(frozenTail.githubLink.height).toBeCloseTo(48.90625, 3);
  expect(frozenTail.finalBridge.height).toBe(102);
  expect(frozenTail.finalTrack.width).toBeCloseTo(855.21875, 3);
  expect(frozenTail.contact.height).toBe(700);
  expect(frozenTail.contactTitle.width).toBe(346);
  expect(frozenTail.contactButton.width).toBeCloseTo(203.421875, 3);
  expect(frozenTail.contactButton.height).toBe(44);
});

test('mobile polish leaves the 1440 project hierarchy unchanged', async ({ page }) => {
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

  expect(presentation.donerLayout.rect.width).toBe(1372);
  expect(presentation.donerLayout.rect.height).toBe(748);
  expect(presentation.donerCopy.right).toBeCloseTo(564.046875, 3);
  expect(presentation.donerMedia.rect.left).toBeCloseTo(643.234375, 3);
  expect(presentation.donerMedia.rect.width).toBeCloseTo(762.75, 2);

  expect(presentation.schoolLayout.rect.width).toBe(1372);
  expect(presentation.schoolLayout.rect.height).toBe(748);
  expect(presentation.schoolCopy.right).toBeCloseTo(564.046875, 3);
  expect(presentation.schoolMedia.rect.left).toBeCloseTo(643.234375, 3);
  expect(presentation.schoolDesktop.rect.left).toBeCloseTo(899.2020263671875, 3);
  expect(presentation.schoolMobile.rect.left).toBeCloseTo(677.5980224609375, 3);
  expect(presentation.schoolDesktop.rect.width).toBeCloseTo(493.408447265625, 3);
  expect(presentation.schoolMobile.rect.width).toBeCloseTo(315.272705078125, 3);
  expect(presentation.schoolDesktop.angle).toBeCloseTo(1, 2);
  expect(presentation.schoolMobile.angle).toBeCloseTo(-1, 2);

  expect(presentation.telegram.rect.width).toBe(1440);
  expect(presentation.telegram.rect.height).toBe(828);
  expect(presentation.telegramLayout.rect.width).toBe(1372);
  expect(presentation.telegramLayout.rect.height).toBe(748);
  expect(presentation.telegramMobile.rect.left).toBeCloseTo(881.0736694335938, 3);
  expect(presentation.telegramMobile.rect.width).toBeCloseTo(287.07135009765625, 3);
  expect(presentation.telegramMobile.angle).toBeCloseTo(1.5, 2);
});
