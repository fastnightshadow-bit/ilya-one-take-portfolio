# Mobile Portfolio Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the accidental whitespace in the phone layout with intentional full-screen and compact project compositions while keeping Telegram, everything after Telegram, and all layouts from `701px` upward unchanged.

**Architecture:** Add one final, mobile-only stylesheet imported after the existing scene and transition styles. New rules are scoped to the hero, About, and the exact first three project `data-scene` attributes; the only transition override is scoped to the exact `road-to-phone` data attribute. Preserve all shared project markup, content, GSAP code, Telegram selectors, and desktop rules.

**Tech Stack:** TypeScript, semantic HTML templates, CSS Grid, Vitest, Playwright, Vite, GSAP (unchanged), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md`

## Global Constraints

- Apply redesign rules only through `@media (max-width: 700px)`.
- Do not modify `src/components/caseChapter.ts`, `src/components/renderSiteMarkup.ts`, `src/content/siteContent.ts`, or `src/motion/createMotionController.ts`.
- Do not add or modify rules targeting `.case--telegram`, `.github-strip`, `.bridge--final`, or `.contact`.
- Keep the Telegram chapter and everything after it behaviorally identical to public `main` at `1f479c0`.
- Keep all layouts and motion from `701px` upward unchanged.
- No new dependency or image asset.
- Production CSS may be written only after the corresponding Playwright assertion has been observed failing for the expected reason.

---

### Task 1: Lock the immutable Telegram and desktop contracts

**Files:**
- Create: `tests/mobile-layout.spec.ts`

**Interfaces:**
- Consumes: existing semantic selectors from `caseChapter.ts` and viewport contract `<=700px` / `>=701px`.
- Produces: `telegramPresentation(page)` and regression tests that later tasks must keep green.

- [ ] **Step 1: Add a Telegram characterization helper and test**

```ts
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
```

- [ ] **Step 2: Add the desktop preservation test**

```ts
test('mobile polish leaves the 1440 project hierarchy unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="desktop"]')).toBeVisible();
  await expect(page.locator('[data-scene="driving-school"] [data-project-shot="mobile"]')).toBeVisible();
  await expect(page.locator('[data-scene="telegram-shop"] .case__layout')).toHaveCSS('align-items', 'center');
  await expect(page.locator('[data-scene="telegram-shop"]')).toHaveCSS('background-color', 'rgb(213, 240, 235)');
});
```

- [ ] **Step 3: Run the characterization tests**

Run: `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile`

Expected: PASS. If an exact computed value differs, inspect the current public-equivalent source and correct only the expected baseline; do not change production code.

- [ ] **Step 4: Commit the characterization guard**

```bash
git add tests/mobile-layout.spec.ts docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md
git commit -m "test: lock published mobile presentation"
```

### Task 2: Specify the new mobile behavior and prove RED

**Files:**
- Modify: `tests/mobile-layout.spec.ts`
- Modify: `tests/portfolio.spec.ts`

**Interfaces:**
- Consumes: semantic selectors already present in the published markup.
- Produces: failing contracts for hero, About, Doner, School, Shaurma, and the exact School→Shaurma transition.

- [ ] **Step 1: Add hero and About geometry tests**

```ts
test('mobile hero fills the usable screen and centers its copy intentionally', async ({ page }) => {
  for (const height of [664, 844]) {
    await page.setViewportSize({ width: 390, height });
    await page.goto('/');
    const metrics = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>('.site-header')!.getBoundingClientRect();
      const hero = document.querySelector<HTMLElement>('[data-scene="hero"]')!;
      const box = hero.getBoundingClientRect();
      const copy = hero.querySelector<HTMLElement>('.hero__copy')!.getBoundingClientRect();
      return {
        headerBottom: header.bottom,
        heroTop: box.top,
        heroBottom: box.bottom,
        heroHeight: box.height,
        usableHeight: innerHeight - header.height,
        display: getComputedStyle(hero).display,
        centerDelta: Math.abs((copy.top + copy.height / 2) - (box.top + box.height / 2)),
        ghostDisplay: getComputedStyle(hero.querySelector<HTMLElement>('.hero__ghost')!).display,
        scrollDisplay: getComputedStyle(hero.querySelector<HTMLElement>('.hero__scroll')!).display,
      };
    });
    expect(Math.abs(metrics.heroTop - metrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroHeight - metrics.usableHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.heroBottom - height)).toBeLessThanOrEqual(1);
    expect(metrics.display).toBe('grid');
    expect(metrics.centerDelta).toBeLessThanOrEqual(72);
    expect(metrics.ghostDisplay).toBe('none');
    expect(metrics.scrollDisplay).toBe('none');
  }
});

test('mobile About stays in compact normal flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const metrics = await page.locator('[data-scene="about"]').evaluate((about) => {
    const bounds = about.getBoundingClientRect();
    const portrait = about.querySelector<HTMLElement>('.about__portrait')!;
    const facts = about.querySelector<HTMLElement>('.about__facts')!;
    return {
      height: bounds.height,
      columns: getComputedStyle(about).gridTemplateColumns.split(' ').length,
      portraitPosition: getComputedStyle(portrait).position,
      factsPosition: getComputedStyle(facts).position,
      portraitBottom: portrait.getBoundingClientRect().bottom,
      factsBottom: facts.getBoundingClientRect().bottom,
      aboutBottom: bounds.bottom,
    };
  });
  expect(metrics.height).toBeLessThan(850);
  expect(metrics.columns).toBe(2);
  expect(metrics.portraitPosition).not.toBe('absolute');
  expect(metrics.factsPosition).not.toBe('absolute');
  expect(metrics.portraitBottom).toBeLessThanOrEqual(metrics.aboutBottom + .5);
  expect(metrics.factsBottom).toBeLessThanOrEqual(metrics.aboutBottom + .5);
});
```

- [ ] **Step 2: Add project composition tests**

```ts
const projectGeometry = (page: Page, id: string) => page.locator(`[data-scene="${id}"]`).evaluate((scene) => {
  const chapter = scene.getBoundingClientRect();
  const copy = scene.querySelector<HTMLElement>('.case__copy')!.getBoundingClientRect();
  const media = scene.querySelector<HTMLElement>('[data-project-media]')!.getBoundingClientRect();
  return { chapter, copy, media };
});

test('Doner is a compact non-overlapping angled composition on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const scene = page.locator('[data-scene="pivnoy-doner"]');
  const geometry = await projectGeometry(page, 'pivnoy-doner');
  const angles = await scene.locator('[data-project-shot]').evaluateAll((shots) => shots.map((shot) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(shot).transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  }));
  expect(geometry.copy.right).toBeLessThanOrEqual(geometry.media.left);
  expect(Math.abs((geometry.copy.top + geometry.copy.height / 2) - (geometry.media.top + geometry.media.height / 2))).toBeLessThan(90);
  expect(geometry.media.height / geometry.chapter.height).toBeGreaterThan(.6);
  expect(angles[0]).toBeLessThan(0);
  expect(angles[1]).toBeGreaterThan(0);
});

test('School shows one tilted phone beside centered copy and a styled action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const scene = page.locator('[data-scene="driving-school"]');
  const geometry = await projectGeometry(page, 'driving-school');
  await expect(scene.locator('[data-project-shot="mobile"]')).toBeVisible();
  await expect(scene.locator('[data-project-shot="desktop"]')).toBeHidden();
  expect(geometry.copy.right).toBeLessThanOrEqual(geometry.media.left);
  expect(Math.abs((geometry.copy.top + geometry.copy.height / 2) - (geometry.media.top + geometry.media.height / 2))).toBeLessThan(90);
  await expect(scene.locator('.case__action')).toHaveCSS('background-color', 'rgb(245, 207, 69)');
  await expect(scene.locator('.case__action')).not.toHaveCSS('box-shadow', 'none');
});

test('Shaurma headline wraps as two meaningful lines without changing its phone structure', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const scene = page.locator('[data-scene="shaurma-mobile"]');
  await expect(scene.locator('[data-project-shot]')).toHaveCount(1);
  const lineCounts = await scene.locator('.case__headline').evaluate((headline) => {
    const first = document.createRange();
    first.selectNodeContents(headline.firstChild!);
    const accent = document.createRange();
    accent.selectNodeContents(headline.querySelector('.case__accent')!);
    return { first: first.getClientRects().length, accent: accent.getClientRects().length };
  });
  expect(lineCounts).toEqual({ first: 1, accent: 1 });
});

test('School to Shaurma running text uses the requested black strip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const bridge = page.locator('[data-transition="road-to-phone"]');
  await expect(bridge).toHaveCSS('background-color', 'rgb(17, 17, 22)');
  await expect(bridge).toHaveCSS('color', 'rgb(241, 238, 230)');
});
```

- [ ] **Step 3: Update existing School proof expectations for mobile**

In `expectRealProjectProofs`, branch only the School desktop shot at `viewportWidth <= 700`: keep its DOM, source, alt, loading, and decoding checks, assert it is hidden, and skip image-loaded, visible-box, and intersection checks for that one hidden proof. In `AutoSchool keeps its mobile proof visually primary`, assert the secondary proof is hidden for widths `<=700` and retain the existing visual-area hierarchy assertions from `701px` upward.

- [ ] **Step 4: Run the focused suite and verify RED**

Run: `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile`

Expected failures: hero is not grid and ghost is visible; About is `1240px` with absolute portrait/facts; Doner and School are not side by side; School desktop is visible; Shaurma text spans multiple lines; `road-to-phone` is yellow. Telegram characterization must remain PASS.

### Task 3: Implement the isolated phone stylesheet

**Files:**
- Create: `src/styles/mobile-polish.css`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: existing data-scene attributes and authored project-shot classes.
- Produces: final phone layout without changing markup or JavaScript.

- [ ] **Step 1: Import the final mobile stylesheet after transitions**

Add this line in `src/styles/index.css` after `@import './transitions.css';` and before motion:

```css
@import './mobile-polish.css';
```

- [ ] **Step 2: Implement full-screen hero and compact About**

Create `src/styles/mobile-polish.css` with the following scoped foundation:

```css
@media (max-width: 700px) {
  [data-scene="hero"] {
    display: grid;
    min-height: calc(100svh - 61px);
    grid-template-rows: auto 1fr;
  }
  [data-scene="hero"] .hero__copy { align-self: center; padding: 0 0 2rem; }
  [data-scene="hero"] .hero__ghost,
  [data-scene="hero"] .hero__scroll { display: none; }

  [data-scene="about"] {
    position: relative;
    display: grid;
    min-height: 0;
    grid-template-columns: minmax(0, 1.12fr) minmax(8.25rem, .88fr);
    grid-template-rows: auto auto auto;
    gap: 1.25rem 1rem;
    padding-bottom: 1.5rem;
  }
  [data-scene="about"] > .scene__meta { grid-column: 1 / -1; }
  [data-scene="about"] .about__copy { grid-column: 1; grid-row: 2; width: auto; padding-top: 1.5rem; }
  [data-scene="about"] h2 { font-size: clamp(2.35rem, 11vw, 3rem); }
  [data-scene="about"] .about__lede { font-size: .78rem; }
  [data-scene="about"] .about__promise { font-size: clamp(1.35rem, 6vw, 1.75rem); }
  [data-scene="about"] .about__portrait {
    position: relative;
    inset: auto;
    grid-column: 2;
    grid-row: 2;
    width: 100%;
    height: 100%;
    min-height: 15rem;
    opacity: 1;
  }
  [data-scene="about"] .about__facts {
    position: static;
    display: grid;
    grid-column: 1 / -1;
    grid-row: 3;
    grid-template-columns: 1fr 1fr;
    width: auto;
    margin: 0;
  }
  [data-scene="about"] .about__facts p { background: transparent; }
  [data-scene="about"] .about__facts p:last-child { grid-column: 1 / -1; }
}
```

- [ ] **Step 3: Run hero and About tests to verify GREEN**

Run: `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile -g "hero|About"`

Expected: PASS.

- [ ] **Step 4: Commit the opening chapters**

```bash
git add src/styles/index.css src/styles/mobile-polish.css tests/mobile-layout.spec.ts
git commit -m "feat: tighten mobile opening chapters"
```

### Task 4: Implement the first three project compositions

**Files:**
- Modify: `src/styles/mobile-polish.css`
- Modify: `tests/portfolio.spec.ts`

**Interfaces:**
- Consumes: the failing project contracts from Task 2.
- Produces: mobile-only Doner, School, and Shaurma overrides; Telegram remains governed solely by existing CSS.

- [ ] **Step 1: Add scoped Doner overrides**

```css
@media (max-width: 700px) {
  [data-scene="pivnoy-doner"] .case__layout {
    grid-template-columns: minmax(0, .9fr) minmax(9.5rem, 1.1fr);
    gap: 1rem;
    align-items: center;
    padding-top: 2rem;
  }
  [data-scene="pivnoy-doner"] .case__headline { font-size: clamp(1.85rem, 8vw, 2.2rem); }
  [data-scene="pivnoy-doner"] .case__headline + p { font-size: .75rem; }
  [data-scene="pivnoy-doner"] .case__label { display: none; }
  [data-scene="pivnoy-doner"] [data-project-media] {
    position: relative;
    display: block;
    min-height: 15rem;
    padding: 0;
  }
  [data-scene="pivnoy-doner"] [data-project-shot="desktop"] {
    position: absolute;
    right: 0;
    top: 3.25rem;
    width: 106%;
    transform: rotate(-3deg);
  }
  [data-scene="pivnoy-doner"] [data-project-shot="mobile"] {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
    width: 56%;
    transform: rotate(3deg);
  }
}
```

- [ ] **Step 2: Add scoped School overrides**

```css
@media (max-width: 700px) {
  [data-scene="driving-school"] .case__layout {
    grid-template-columns: minmax(0, .92fr) minmax(8.75rem, 1.08fr);
    gap: .75rem;
    align-items: center;
    padding-top: 2rem;
  }
  [data-scene="driving-school"] .case__headline { font-size: clamp(1.75rem, 7.5vw, 2.05rem); }
  [data-scene="driving-school"] .case__headline + p { font-size: .75rem; }
  [data-scene="driving-school"] .case__label { display: none; }
  [data-scene="driving-school"] [data-project-media] {
    position: relative;
    display: block;
    min-height: 21rem;
    padding: 0;
  }
  [data-scene="driving-school"] [data-project-shot="mobile"] {
    position: absolute;
    right: .35rem;
    top: 0;
    width: calc(100% - .7rem);
    transform: rotate(-2deg);
  }
  [data-scene="driving-school"] [data-project-shot="desktop"] { display: none; }
  [data-scene="driving-school"] .case__action { margin-top: 1rem; box-shadow: 5px 5px 0 var(--ink); }
}
```

- [ ] **Step 3: Add Shaurma typography-only and exact transition overrides**

```css
@media (max-width: 700px) {
  [data-scene="shaurma-mobile"] .case__copy { align-self: center; }
  [data-scene="shaurma-mobile"] .case__headline {
    font-size: clamp(1.55rem, 6.7vw, 1.85rem);
    line-height: .92;
    overflow-wrap: normal;
    word-break: normal;
  }
  [data-transition="road-to-phone"] {
    border-color: var(--border-dark);
    background: #111116;
    color: var(--paper);
  }
}
```

- [ ] **Step 4: Run focused project tests to verify GREEN**

Run: `npm run e2e -- tests/mobile-layout.spec.ts tests/portfolio.spec.ts --project=mobile`

Expected: PASS, including the Telegram characterization.

- [ ] **Step 5: Verify the `701px` boundary and desktop hierarchy**

Run: `npm run e2e -- tests/mobile-layout.spec.ts tests/portfolio.spec.ts --project=desktop`

Expected: PASS; the School desktop proof is visible and visually secondary from `701px` upward.

- [ ] **Step 6: Commit the project polish**

```bash
git add src/styles/mobile-polish.css tests/mobile-layout.spec.ts tests/portfolio.spec.ts
git commit -m "feat: polish mobile project chapters"
```

### Task 5: Full verification, review, and public deployment

**Files:**
- Verify: all modified files
- Update only if verification finds a defect: the closest owning test and source file

**Interfaces:**
- Consumes: completed mobile CSS and regression suite.
- Produces: verified production build and public GitHub Pages deployment.

- [ ] **Step 1: Run formatting and diff checks**

Run: `git diff --check origin/main...HEAD`

Expected: no output.

- [ ] **Step 2: Run the full quality gate**

Run: `npm run check`

Expected: unit tests, type checking, build, production Playwright, SEO verification, and Lighthouse all PASS with no new warnings.

- [ ] **Step 3: Perform browser visual verification**

Inspect `390×844`, `360×800`, `700×900`, `701×900`, and `1440×900`. Confirm:

- centered full-screen hero;
- compact About with visible clothing;
- no Doner copy/media overlap or beige void;
- School phone-only mobile composition and styled action;
- Shaurma two meaningful headline lines;
- Telegram, GitHub, final handoff, and Contact unchanged;
- no horizontal overflow or broken image.

- [ ] **Step 4: Request independent code and spec review**

Review the diff for scoped selectors, Telegram preservation, desktop preservation, accessibility, reduced motion, and test quality. Fix every critical or important finding and rerun the affected test plus `npm run check`.

- [ ] **Step 5: Commit any final verification fixes**

```bash
git add src/styles/mobile-polish.css src/styles/index.css tests/mobile-layout.spec.ts tests/portfolio.spec.ts docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md
git commit -m "fix: finalize responsive portfolio polish"
```

Skip this commit when Step 4 required no changes.

- [ ] **Step 6: Publish to public `main`**

Fast-forward the publishing checkout from the completed feature branch, push `main` with the user's already explicit authorization, and wait for `.github/workflows/deploy-pages.yml` to complete.

- [ ] **Step 7: Verify the public URL**

Open `https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/`, confirm the deployed commit and the mobile layout, then provide the URL and verification summary to the user.
