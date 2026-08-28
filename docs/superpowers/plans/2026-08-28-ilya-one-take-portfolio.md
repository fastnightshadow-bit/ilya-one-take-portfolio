# Ilya One-Take Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, mobile-first personal portfolio for Ilya that presents him, four real projects, a public GitHub profile, and a direct Telegram CTA as one continuous animated story.

**Architecture:** A static Vite and strict TypeScript site renders seven semantic scenes from one typed content module. Focused renderer modules own each scene, four project presentations and the GitHub strip, while a separate GSAP/ScrollTrigger controller progressively enhances the already-readable page with six transitions and cleanly disables motion for reduced-motion users. Six approved source captures are built deterministically into 24 AVIF/WebP/JPG delivery files.

**Tech Stack:** Vite, TypeScript, semantic HTML, modular CSS, GSAP with ScrollTrigger, Vitest with jsdom, Playwright, axe-core, Sharp, Lighthouse CI.

**Spec:** `docs/superpowers/specs/2026-08-28-ilya-one-take-portfolio-design.md`

## Global Constraints

- Build one long adaptive page with no router, backend, database, CMS, form, blog, authentication, or multilingual layer.
- Do not add React or any second animation library.
- Use only `https://t.me/girtopw` for the primary CTA.
- Present exactly these four projects: `Пивной Донер`, `Автошкола «Перекрёсток»`, `Шаурма Халяль 1`, and `VeachelSell`.
- Use only the approved public project URLs from `siteContent.ts`; do not invent reviews, years of experience, metrics, awards, or client outcomes.
- Keep the AutoSchool mobile capture visually primary at every supported layout tier; keep Shaurma and VeachelSell phone-only instead of inventing desktop versions.
- Link the GitHub strip to `https://github.com/fastnightshadow-bit`.
- The site must remain readable and navigable when JavaScript fails and when `prefers-reduced-motion: reduce` is active.
- Support 360–430 px mobile, 768–1024 px tablet, and 1280–1600 px desktop layouts without horizontal scrolling.
- Maintain WCAG AA text contrast, visible keyboard focus, semantic heading order, and targets of at least 44×44 px.
- Production Lighthouse targets: Performance ≥85, Accessibility ≥95, Best Practices ≥95, SEO ≥95.
- Use `src/assets/source/portrait-clean-neutral.png` as the approved source portrait; generated delivery assets live under `public/assets/portrait/`.
- Keep the six approved source captures under `src/assets/source/projects/`; generate exactly 24 project delivery assets under `public/assets/projects/` and remove stale generated project files on rebuild.
- Keep `.superpowers/`, `work/`, `dist/`, test output, and dependency directories out of Git.

## File Structure

```text
.
├── .gitignore                         # Generated and local-only files
├── README.md                          # Local development and verification commands
├── index.html                         # Static fallback shell and baseline metadata
├── package.json                       # Scripts and dependencies
├── package-lock.json                  # Pinned dependency graph
├── tsconfig.json                      # Strict TypeScript settings
├── vite.config.ts                     # Vite and Vitest configuration
├── playwright.config.ts               # Browser projects and local web server
├── lighthouserc.json                  # Production quality budgets
├── scripts/
│   ├── build-assets.mjs               # Orchestrates portrait and project asset pipelines
│   ├── build-project-assets.mjs       # Six captures → exact 24-file delivery matrix
│   ├── build-project-assets.test.mjs  # Isolated cleanup and asset-matrix test
│   ├── run-lighthouse.mjs             # Production Lighthouse gate
│   └── verify-dist-seo.mjs            # Built-HTML metadata verification
├── public/
│   ├── favicon.svg                    # Simple Ilya mark
│   ├── robots.txt                     # Search crawler policy
│   ├── social-card.png                # 1200×630 social preview image
│   └── assets/
│       ├── portrait/                  # Generated portrait delivery images
│       └── projects/                  # 24 generated AVIF/WebP/JPG project images
├── src/
│   ├── main.ts                        # Application bootstrap
│   ├── content/
│   │   ├── siteContent.ts             # Typed copy, links, project themes
│   │   └── siteContent.test.ts        # Content invariants
│   ├── components/
│   │   ├── dom.ts                     # Safe DOM creation helper
│   │   ├── siteHeader.ts              # Sticky header
│   │   ├── heroScene.ts               # Opening Type Reactor scene
│   │   ├── aboutScene.ts              # Personal trust scene
│   │   ├── processStrip.ts             # Four-step process
│   │   ├── transitionBridge.ts         # Semantic visual bridges
│   │   ├── caseChapter.ts              # Shared project chapter renderer
│   │   ├── githubStrip.ts              # Public code/profile proof
│   │   ├── contactScene.ts             # Telegram close
│   │   ├── renderSiteMarkup.ts          # Server-safe full-page HTML string
│   │   ├── createSite.ts               # Page composition
│   │   └── createSite.test.ts          # Semantic structure and CTA tests
│   ├── motion/
│   │   ├── createMotionController.ts   # GSAP setup, refresh, teardown
│   │   └── createMotionController.test.ts
│   ├── seo/
│   │   ├── applyMetadata.ts            # Standard, OG, Twitter, JSON-LD metadata
│   │   └── applyMetadata.test.ts
│   ├── styles/
│   │   ├── index.css                   # Style entrypoint
│   │   ├── tokens.css                  # Color, type, spacing, motion tokens
│   │   ├── base.css                    # Reset, typography, focus, utilities
│   │   ├── layout.css                  # Header, chapters, responsive grids
│   │   ├── scenes.css                  # Hero, about, project, CTA visuals
│   │   └── motion.css                  # Initial animated states and reduced motion
│   └── assets/source/
│       ├── portrait-clean-neutral.png  # Versioned approved portrait source
│       └── projects/                   # Six approved desktop/mobile source captures
└── tests/
    ├── portfolio.spec.ts               # Content, CTA, scrolling, responsive behavior
    ├── portrait-layout.spec.ts          # Portrait layout regression coverage
    └── accessibility.spec.ts           # Axe and keyboard checks
```

---

### Task 1: Establish the Toolchain and Typed Content Contract

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/content/siteContent.test.ts`
- Create: `src/content/siteContent.ts`

**Interfaces:**
- Produces: `SiteContent`, `ProjectContent`, `TransitionContent`, and `siteContent` from `src/content/siteContent.ts`.
- Consumes: no earlier task interfaces.

- [ ] **Step 1: Initialize dependencies and scripts**

Run:

```bash
npm init -y
npm install gsap
npm install -D typescript vite vitest jsdom @types/node @playwright/test @axe-core/playwright sharp @lhci/cli
```

Update the scripts and engine section in `package.json` to exactly:

```json
{
  "type": "module",
  "engines": { "node": ">=20.19" },
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "e2e": "playwright test",
    "audit": "lhci autorun",
    "check": "npm run test && npm run build && npm run e2e"
  }
}
```

- [ ] **Step 2: Add repository and compiler configuration**

Create `.gitignore`:

```gitignore
node_modules/
dist/
.superpowers/
work/
test-results/
playwright-report/
.lighthouseci/
.DS_Store
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals", "node"],
    "skipLibCheck": true
  },
  "include": ["src", "tests", "vite.config.ts", "playwright.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
```

Create `index.html` with meaningful no-script content:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0c0c10" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>Илья — веб-разработчик для бизнеса</title>
  </head>
  <body>
    <div id="app">
      <main>
        <h1>Илья — веб-разработчик</h1>
        <p>Придумываю, проектирую и разрабатываю сайты для бизнеса.</p>
        <a href="https://t.me/girtopw">Написать в Telegram</a>
      </main>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Write the failing content contract test**

Create `src/content/siteContent.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteContent } from './siteContent';

describe('siteContent', () => {
  it('contains the approved contact and four verified project destinations', () => {
    expect(siteContent.telegramUrl).toBe('https://t.me/girtopw');
    expect(siteContent.githubUrl).toBe('https://github.com/fastnightshadow-bit');
    expect(siteContent.projects.map((project) => [project.id, project.action.href, project.presentation.primary])).toEqual([
      ['pivnoy-doner', 'https://pivdoner.ru/', 'desktop'],
      ['driving-school', 'https://perekrestok-yaroslavl.netlify.app/', 'mobile'],
      ['shaurma-mobile', 'https://fastnightshadow-bit.github.io/chaurma/', 'mobile'],
      ['telegram-shop', 'https://t.me/veachelsell_bot', 'mobile'],
    ]);
  });

  it('contains four process steps and no unverified metrics', () => {
    expect(siteContent.process).toHaveLength(4);
    const serialized = JSON.stringify(siteContent);
    expect(serialized).not.toMatch(/\d+%|отзыв|наград|лет опыта/i);
  });
});
```

- [ ] **Step 4: Run the test and verify the missing-module failure**

Run: `npm test -- src/content/siteContent.test.ts`

Expected: FAIL because `./siteContent` does not exist.

- [ ] **Step 5: Implement the typed content module**

Create `src/content/siteContent.ts`. The current contract includes screenshot metadata, real destinations, responsive/phone presentation modes, GitHub, and six transition descriptors:

```ts
export type ProjectTheme = 'doner' | 'school' | 'mobile' | 'telegram';

export interface ProjectScreenshot {
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export type ProjectPresentation =
  | { readonly kind: 'responsive'; readonly primary: 'desktop' | 'mobile'; readonly desktop: ProjectScreenshot; readonly mobile: ProjectScreenshot }
  | { readonly kind: 'phone'; readonly primary: 'mobile'; readonly mobile: ProjectScreenshot };

export interface ProjectContent {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly accent: string;
  readonly description: string;
  readonly chapterLabel: string;
  readonly theme: ProjectTheme;
  readonly action: { readonly href: `https://${string}`; readonly label: string };
  readonly presentation: ProjectPresentation;
}

export interface TransitionContent {
  readonly phrase: string;
  readonly variant: 'ink' | 'route' | 'mobile' | 'chat' | 'final';
}

export interface SiteContent {
  readonly telegramUrl: string;
  readonly telegramHandle: string;
  readonly githubUrl: `https://${string}`;
  readonly rotatingWords: readonly string[];
  readonly process: readonly { number: string; title: string; detail: string }[];
  readonly projects: readonly ProjectContent[];
  readonly transitions: readonly TransitionContent[];
}

export const siteContent: SiteContent = {
  telegramUrl: 'https://t.me/girtopw',
  telegramHandle: '@girtopw',
  githubUrl: 'https://github.com/fastnightshadow-bit',
  rotatingWords: ['цепляют.', 'продают.', 'помнят.'],
  process: [/* four approved steps */],
  projects: [
    {
      id: 'pivnoy-doner',
      title: 'Пивной Донер',
      theme: 'doner',
      action: { href: 'https://pivdoner.ru/', label: 'Открыть сайт' },
      presentation: { kind: 'responsive', primary: 'desktop', desktop: {/* 1280×720 */}, mobile: {/* 390×844 */} },
      // approved copy fields omitted here for brevity
    },
    {
      id: 'driving-school',
      title: 'Автошкола «Перекрёсток»',
      theme: 'school',
      action: { href: 'https://perekrestok-yaroslavl.netlify.app/', label: 'Открыть сайт' },
      presentation: { kind: 'responsive', primary: 'mobile', desktop: {/* 1280×720 */}, mobile: {/* 390×844 */} },
      // approved copy fields omitted here for brevity
    },
    {
      id: 'shaurma-mobile',
      title: 'Шаурма Халяль 1',
      theme: 'mobile',
      action: { href: 'https://fastnightshadow-bit.github.io/chaurma/', label: 'Открыть mobile-сайт' },
      presentation: { kind: 'phone', primary: 'mobile', mobile: {/* 390×844 */} },
      // approved copy fields omitted here for brevity
    },
    {
      id: 'telegram-shop',
      title: 'VeachelSell',
      theme: 'telegram',
      action: { href: 'https://t.me/veachelsell_bot', label: 'Запустить бота' },
      presentation: { kind: 'phone', primary: 'mobile', mobile: {/* 390×844 */} },
      // approved copy fields omitted here for brevity
    },
  ],
  transitions: [
    { phrase: 'ИДЕЯ → ДИЗАЙН → КОД → РЕЗУЛЬТАТ', variant: 'ink' },
    { phrase: 'БИЗНЕС → ВКУС → БРЕНД → ЗАКАЗ', variant: 'ink' },
    { phrase: 'ОТ ПЕРВОГО КЛИКА — К ПЕРВОЙ ПОЕЗДКЕ', variant: 'route' },
    { phrase: 'ROAD → MOBILE → MENU → ORDER', variant: 'mobile' },
    { phrase: 'WEB → CHAT → CATALOG → SHOP', variant: 'chat' },
    { phrase: 'DESIGN × CODE × BUSINESS', variant: 'final' },
  ],
};
```

- [ ] **Step 6: Run the content tests**

Run: `npm test -- src/content/siteContent.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 7: Commit the toolchain and content contract**

```bash
git add .gitignore package.json package-lock.json tsconfig.json vite.config.ts index.html src/content
git commit -m "chore: scaffold typed portfolio foundation"
```

---

### Task 2: Render the Complete Semantic Page

**Files:**
- Create: `src/components/dom.ts`
- Create: `src/components/siteHeader.ts`
- Create: `src/components/heroScene.ts`
- Create: `src/components/aboutScene.ts`
- Create: `src/components/processStrip.ts`
- Create: `src/components/transitionBridge.ts`
- Create: `src/components/caseChapter.ts`
- Create: `src/components/githubStrip.ts`
- Create: `src/components/contactScene.ts`
- Create: `src/components/renderSiteMarkup.ts`
- Create: `src/components/createSite.test.ts`
- Create: `src/components/createSite.ts`
- Create: `src/main.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `SiteContent`, `ProjectContent`, `TransitionContent`, and `siteContent` from Task 1.
- Produces: `renderSiteMarkup(content: SiteContent): string`, `createSite(content: SiteContent): HTMLElement`, and a Vite HTML transform that embeds the complete story into the production HTML before JavaScript runs.

- [ ] **Step 1: Write the failing page-structure test**

Create `src/components/createSite.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent';
import { createSite } from './createSite';

describe('createSite', () => {
  it('renders the approved story in order', () => {
    const site = createSite(siteContent);
    document.body.replaceChildren(site);

    expect([...document.querySelectorAll<HTMLElement>('[data-scene]')].map((node) => node.dataset.scene)).toEqual([
      'hero', 'about', 'pivnoy-doner', 'driving-school', 'shaurma-mobile', 'telegram-shop', 'contact',
    ]);
    expect(document.querySelectorAll('[data-project]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-project-media] img')).toHaveLength(6);
    expect(document.querySelectorAll('[data-transition]')).toHaveLength(6);
    expect(document.querySelector('h1')?.textContent).toContain('Сайты, которые');
  });

  it('renders verified project, GitHub, and Telegram destinations', () => {
    const site = createSite(siteContent);
    expect([...site.querySelectorAll<HTMLAnchorElement>('[data-project-action]')].map((link) => link.href)).toEqual([
      'https://pivdoner.ru/',
      'https://perekrestok-yaroslavl.netlify.app/',
      'https://fastnightshadow-bit.github.io/chaurma/',
      'https://t.me/veachelsell_bot',
    ]);
    expect(site.querySelector<HTMLAnchorElement>('[data-github-link]')?.href).toBe('https://github.com/fastnightshadow-bit');
    expect([...site.querySelectorAll<HTMLAnchorElement>('[data-primary-cta]')].every((link) => link.href === 'https://t.me/girtopw')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the structure test and verify failure**

Run: `npm test -- src/components/createSite.test.ts`

Expected: FAIL because `createSite.ts` does not exist.

- [ ] **Step 3: Add the DOM helper and focused renderers**

Create `src/components/dom.ts`:

```ts
export function elementFromHtml<T extends HTMLElement>(markup: string): T {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  const element = template.content.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error('Renderer returned no root element');
  return element as T;
}
```

Create `src/components/siteHeader.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

export const siteHeader = (content: SiteContent) => `
  <header class="site-header">
    <a class="site-header__brand" href="#top">ILYA / WEB DEVELOPER</a>
    <span class="site-header__position"><i aria-hidden="true"></i>DESIGN × CODE × LAUNCH</span>
    <a class="site-header__contact" data-primary-cta href="${content.telegramUrl}">${content.telegramHandle} ↗</a>
  </header>`;
```

Create `src/components/heroScene.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

export const heroScene = (content: SiteContent) => `
  <section class="scene hero" id="top" data-scene="hero" aria-labelledby="hero-title">
    <div class="scene__meta"><span>Independent web developer</span><span>01 / Intro</span></div>
    <span class="hero__ghost" aria-hidden="true">01</span>
    <div class="hero__copy">
      <h1 id="hero-title">Сайты,<br>которые <span class="hero__word" data-rotating-word data-words="${content.rotatingWords.join('|')}">${content.rotatingWords[0]}</span></h1>
      <p>Я Илья. Придумываю, проектирую и разрабатываю сайты для бизнеса — от первой идеи до запуска.</p>
      <a class="button" href="#about">Смотреть дальше ↓</a>
    </div>
    <span class="hero__scroll" aria-hidden="true">SCROLL TO TRANSFORM</span>
  </section>`;
```

Create `src/components/aboutScene.ts`:

```ts
export const aboutScene = () => `
  <section class="scene about" id="about" data-scene="about" aria-labelledby="about-title">
    <div class="scene__meta"><span>Человек за проектами</span><span>02 / Илья</span></div>
    <div class="about__copy">
      <p class="eyebrow">Привет. Я — Илья.</p>
      <h2 id="about-title">Делаю сайты <span>лично.</span></h2>
      <p class="about__lede">Разбираюсь в задаче, предлагаю идею, проектирую интерфейс и пишу код. Ты общаешься со мной напрямую — от первого разговора до запуска.</p>
      <p class="about__promise" data-about-promise><span class="about__promise-line"><span>ОДИН ЧЕЛОВЕК.</span></span> <span class="about__promise-line"><span>ВЕСЬ САЙТ.</span></span></p>
    </div>
    <picture class="about__portrait">
      <source type="image/avif" srcset="/assets/portrait/portrait-720.avif 720w, /assets/portrait/portrait-1200.avif 1200w" sizes="(max-width: 700px) 98vw, 47vw">
      <source type="image/webp" srcset="/assets/portrait/portrait-720.webp 720w, /assets/portrait/portrait-1200.webp 1200w" sizes="(max-width: 700px) 98vw, 47vw">
      <img src="/assets/portrait/portrait-1200.png" width="1200" height="1500" sizes="(max-width: 700px) 98vw, 47vw" alt="Илья, веб-разработчик" loading="lazy" decoding="async">
    </picture>
    <div class="about__facts">
      <p><b>01</b><span>Общение напрямую<small>Без потерянных деталей между людьми</small></span></p>
      <p><b>02</b><span>Дизайн и код в одних руках<small>Идея сохраняется до готового сайта</small></span></p>
      <p><b>03</b><span>Понятный процесс<small>Ты видишь прогресс на каждом этапе</small></span></p>
    </div>
  </section>`;
```

Create `src/components/processStrip.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

export const processStrip = (content: SiteContent) => `
  <section class="process" aria-label="Процесс работы">
    ${content.process.map((step) => `<article><em>${step.number}</em><h2>${step.title}</h2><p>${step.detail}</p></article>`).join('')}
  </section>`;
```

Create `src/components/transitionBridge.ts`:

```ts
import type { TransitionContent } from '../content/siteContent';

export const transitionBridge = (transition: TransitionContent) => `
  <div class="bridge bridge--${transition.variant}" data-transition="${transition.variant}" aria-hidden="true">
    <strong>${transition.phrase} → ${transition.phrase}</strong>
  </div>`;
```

Create `src/components/caseChapter.ts`:

```ts
import type { ProjectContent } from '../content/siteContent';

const screenshotPath = (project: ProjectContent, role: 'desktop' | 'mobile') =>
  `/assets/projects/${project.id}-${role}`;

const projectMedia = (project: ProjectContent) => {
  // Render AVIF/WebP/JPG <picture> sources from project.presentation.
  // Responsive projects include both roles in primary-first order;
  // phone projects render only the confirmed mobile capture.
};

export const caseChapter = (project: ProjectContent) => `
  <section class="scene case case--${project.theme}" id="${project.id}" data-scene="${project.id}" data-project aria-labelledby="${project.id}-title">
    <div class="scene__meta"><span>${project.eyebrow}</span></div>
    <div class="case__layout">
      <div class="case__copy"><h2 id="${project.id}-title" class="case__title">${project.title}</h2><p class="case__headline">${project.headline} <span class="case__accent">${project.accent}</span></p><p>${project.description}</p><a class="case__action" data-project-action href="${project.action.href}">${project.action.label} <span aria-hidden="true">↗</span></a><span class="case__label">${project.chapterLabel}</span></div>
      ${projectMedia(project)}
    </div>
  </section>`;
```

`projectMedia` is implemented in full in `src/components/caseChapter.ts`; its contract is covered by tests for six semantic images, source formats, dimensions, lazy loading, primary role order, and verified destinations.

Create `src/components/githubStrip.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

export const githubStrip = (content: SiteContent) => `
  <aside class="github-strip" aria-labelledby="github-strip-title">
    <div><h2 id="github-strip-title">Код тоже можно посмотреть.</h2><p>Публичные репозитории и новые работы — в профиле Ильи.</p></div>
    <a class="github-strip__link" data-github-link href="${content.githubUrl}">GitHub Ильи <span aria-hidden="true">↗</span></a>
  </aside>`;
```

Create `src/components/contactScene.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

export const contactScene = (content: SiteContent) => `
  <section class="scene contact" data-scene="contact" aria-labelledby="contact-title">
    <div class="scene__meta"><span>Есть задача?</span><span>07 / Contact</span></div>
    <h2 id="contact-title">Давай сделаем <span>твой сайт.</span></h2>
    <p>Напиши пару слов о проекте. Я отвечу лично и предложу, с чего лучше начать.</p>
    <a class="button button--contact" data-primary-cta href="${content.telegramUrl}">Написать в Telegram →</a>
    <a class="contact__handle" data-primary-cta href="${content.telegramUrl}">${content.telegramHandle}</a>
  </section>`;
```

- [ ] **Step 4: Compose server-safe markup and the DOM wrapper**

Create `src/components/renderSiteMarkup.ts`:

```ts
import type { SiteContent } from '../content/siteContent';
import { aboutScene } from './aboutScene';
import { caseChapter } from './caseChapter';
import { contactScene } from './contactScene';
import { heroScene } from './heroScene';
import { githubStrip } from './githubStrip';
import { processStrip } from './processStrip';
import { siteHeader } from './siteHeader';
import { transitionBridge } from './transitionBridge';

export function renderSiteMarkup(content: SiteContent): string {
  const [doner, school, shaurma, telegram] = content.projects;
  if (!doner || !school || !shaurma || !telegram || content.projects.length !== 4) throw new Error('Exactly four projects are required');
  const [toAbout, toDoner, toSchool, toShaurma, toTelegram, toContact] = content.transitions;
  if (!toAbout || !toDoner || !toSchool || !toShaurma || !toTelegram || !toContact || content.transitions.length !== 6) throw new Error('Six transitions are required');

  return `<div class="site-shell" data-site-static>
    ${siteHeader(content)}
    <main>
      ${heroScene(content)}
      ${transitionBridge(toAbout)}
      ${aboutScene()}
      ${processStrip(content)}
      ${transitionBridge(toDoner)}
      ${caseChapter(doner)}
      ${transitionBridge(toSchool)}
      ${caseChapter(school)}
      ${transitionBridge(toShaurma)}
      ${caseChapter(shaurma)}
      ${transitionBridge(toTelegram)}
      ${caseChapter(telegram)}
      ${githubStrip(content)}
      ${transitionBridge(toContact)}
      ${contactScene(content)}
    </main>
  </div>`;
}
```

Create `src/components/createSite.ts`:

```ts
import type { SiteContent } from '../content/siteContent';
import { elementFromHtml } from './dom';
import { renderSiteMarkup } from './renderSiteMarkup';

export function createSite(content: SiteContent): HTMLElement {
  return elementFromHtml(renderSiteMarkup(content));
}
```

- [ ] **Step 5: Embed the complete page into production HTML and bootstrap without replacing it**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vitest/config';
import { siteContent } from './src/content/siteContent';
import { renderSiteMarkup } from './src/components/renderSiteMarkup';

export default defineConfig({
  plugins: [{
    name: 'static-portfolio-markup',
    transformIndexHtml(html) {
      return html.replace('<div id="app"></div>', `<div id="app">${renderSiteMarkup(siteContent)}</div>`);
    },
  }],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
```

Replace the fallback body markup in `index.html` with the exact injection marker:

```html
<div id="app"></div>
```

Create `src/main.ts`:

```ts
import { createSite } from './components/createSite';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app was not found');
if (!app.querySelector('[data-site-static]')) app.replaceChildren(createSite(siteContent));
```

- [ ] **Step 6: Run tests, typecheck, and verify static production markup**

Run:

```bash
npm test -- src/components/createSite.test.ts
npm run typecheck
npm run build
rg -n "data-site-static|Пивной Донер|Автошкола|Шаурма Халяль 1|VeachelSell|GitHub Ильи" dist/index.html
```

Expected: structure tests PASS, TypeScript exits 0, and all seven approved static-content markers are present in `dist/index.html`.

- [ ] **Step 7: Commit the semantic page**

```bash
git add index.html vite.config.ts src/components src/main.ts
git commit -m "feat: render semantic one-take portfolio story"
```

---

### Task 3: Implement the Approved Visual System and Responsive Layout

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/scenes.css`
- Create: `src/styles/motion.css`
- Create: `src/styles/index.css`
- Modify: `src/main.ts`
- Create: `playwright.config.ts`
- Create: `tests/portfolio.spec.ts`

**Interfaces:**
- Consumes: semantic class names and `data-scene` attributes from Task 2.
- Produces: responsive page layout and reusable CSS tokens; Playwright `webServer` contract on port 4173.

- [ ] **Step 1: Configure Playwright and write the failing responsive test**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: { command: 'npm run dev -- --port 4173', port: 4173, reuseExistingServer: true },
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
```

Create `tests/portfolio.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('story is ordered, readable, and has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Сайты, которые');
  await expect(page.locator('[data-project]')).toHaveCount(4);
  await expect(page.locator('[data-project-media] img')).toHaveCount(6);
  await expect(page.locator('[data-transition]')).toHaveCount(6);
  expect(await page.locator('.site-header').evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('[data-primary-cta]').last()).toHaveAttribute('href', 'https://t.me/girtopw');
});
```

Run: `npx playwright install chromium && npm run e2e -- --project=mobile`

Expected: FAIL because the unstyled header is not sticky.

- [ ] **Step 2: Add exact global tokens and base behavior**

Create `src/styles/tokens.css`:

```css
:root {
  --ink: #0c0c10;
  --paper: #f1eee6;
  --coral: #ff553d;
  --blue: #385bf5;
  --yellow: #f5cf45;
  --mint: #d5f0eb;
  --doner-paper: #efe4d2;
  --doner-red: #d83c2b;
  --text-muted-dark: #aaa7af;
  --text-muted-light: #656159;
  --border-dark: #303038;
  --page-pad: clamp(1.375rem, 3vw, 2.125rem);
  --scene-min: clamp(43.75rem, 88svh, 57.5rem);
  --ease-story: cubic-bezier(.65, 0, .35, 1);
}
```

Create `src/styles/base.css`:

```css
* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--ink); }
body { margin: 0; overflow-x: clip; background: var(--ink); color: var(--paper); font-family: Inter, Arial, sans-serif; }
button, a { font: inherit; }
a { color: inherit; }
img, svg { display: block; max-width: 100%; }
:focus-visible { outline: 3px solid var(--yellow); outline-offset: 4px; }
.button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: .85rem 1.1rem; border-radius: 999px; background: var(--paper); color: var(--ink); font: 900 .75rem/1 ui-monospace, monospace; text-transform: uppercase; text-decoration: none; }
```

- [ ] **Step 3: Implement layout and scene CSS with fixed mobile behavior**

Create `src/styles/layout.css` with these exact layout rules:

```css
.site-shell { min-width: 0; overflow: clip; }
.site-header { position: sticky; top: 0; z-index: 100; display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 1rem; padding: 0 var(--page-pad); border-bottom: 1px solid #28282e; background: rgb(12 12 16 / .92); backdrop-filter: blur(16px); font: 800 .625rem/1 ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; }
.site-header a { min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; }
.site-header__position i { display: inline-block; width: 6px; height: 6px; margin-right: .5rem; border-radius: 50%; background: var(--coral); box-shadow: 0 0 12px var(--coral); }
.scene { position: relative; min-height: var(--scene-min); overflow: clip; padding: var(--page-pad); isolation: isolate; }
.scene__meta { position: relative; z-index: 10; display: flex; justify-content: space-between; gap: 1rem; font: 800 .625rem/1.2 ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; }
.bridge { position: relative; display: flex; min-height: 118px; align-items: center; overflow: hidden; padding: 1.25rem var(--page-pad); border-block: 1px solid var(--border-dark); background: #111116; }
.bridge small { position: absolute; left: var(--page-pad); top: 1rem; z-index: 2; color: #8e8b94; font: 800 .55rem/1 ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; }
.bridge strong { font: 900 clamp(2rem, 5.7vw, 4.75rem)/.82 Arial, sans-serif; letter-spacing: -.06em; white-space: nowrap; }
.process { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--ink); }
.process article { min-height: 142px; padding: 1.4rem; border-right: 1px solid var(--border-dark); }
.process article:last-child { border-right: 0; }

@media (max-width: 700px) {
  .site-header__position { display: none; }
  .scene { min-height: 700px; }
  .process { grid-template-columns: 1fr 1fr; }
  .process article:nth-child(2) { border-right: 0; }
  .bridge { min-height: 102px; }
}
```

Create `src/styles/scenes.css`:

```css
/* Non-exhaustive layout contract; src/styles/scenes.css is authoritative. */
.hero__word { display: inline-block; min-width: 5.2ch; color: var(--coral); }
.about { min-height: 840px; background: var(--paper); color: var(--ink); }
.about__promise-line { display: block; overflow: hidden; }
.case__layout { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); gap: clamp(2rem, 5vw, 5rem); }
.case__media { position: relative; min-width: 0; }
.project-shot img { display: block; width: 100%; height: auto; object-fit: cover; object-position: top; }
.project-shot--desktop { border: 3px solid var(--ink); border-radius: 18px; background: var(--ink); }
.project-shot--mobile { border: 4px solid var(--ink); border-radius: 36px; background: var(--ink); }
.case--doner .project-shot--desktop { width: 100%; }
.case--school .project-shot--mobile { position: relative; z-index: 2; }
.case__media--phone .project-shot--mobile { width: clamp(15rem, 48%, 17rem); }
.case__action, .github-strip__link { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; }
.github-strip { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; }

@media (max-width: 700px) {
  .case__layout { grid-template-columns: minmax(0, 1fr); }
  .case__media--responsive { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); }
  .case__media--phone .project-shot--mobile { width: 100%; max-width: 12rem; }
  .case__action, .github-strip__link { min-height: 44px; }
  .github-strip { grid-template-columns: 1fr; }
}
```

The complete stylesheet assigns a distinct palette to all four chapters, keeps AutoSchool mobile-first at mobile/tablet/desktop tiers, composes Doner desktop-first, and uses only real project media instead of the superseded decorative mockups.

Create `src/styles/motion.css`:

```css
[data-motion-ready] .about__portrait img { filter: grayscale(1) contrast(1.08); }
[data-motion-ready] .about__promise-line > span { opacity: 0; }
[data-motion-ready] [data-project] .case__copy { will-change: transform, opacity; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .about__portrait img { filter: grayscale(0) contrast(1.02) !important; }
  .about__promise-line > span, [data-project-media], [data-project] .case__copy { opacity: 1 !important; transform: none !important; }
}
```

Create `src/styles/index.css`:

```css
@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './scenes.css';
@import './motion.css';
```

Add the style import as the first line of `src/main.ts`:

```ts
import './styles/index.css';
```

- [ ] **Step 4: Run browser tests on mobile and desktop**

Run: `npm run e2e`

Expected: both viewport projects PASS; no horizontal overflow, seven scenes, four project chapters, six real captures, and six transitions are visible.

- [ ] **Step 5: Commit the responsive visual system**

```bash
git add src/styles src/main.ts playwright.config.ts tests/portfolio.spec.ts
git commit -m "feat: add responsive editorial scene system"
```

---

### Task 4: Build and Integrate the Approved Portrait Assets

**Files:**
- Create: `src/assets/source/portrait-clean-neutral.png`
- Create: `scripts/build-assets.mjs`
- Modify: `package.json`
- Generate: `public/assets/portrait/portrait-720.avif`
- Generate: `public/assets/portrait/portrait-720.webp`
- Generate: `public/assets/portrait/portrait-1200.avif`
- Generate: `public/assets/portrait/portrait-1200.webp`
- Generate: `public/assets/portrait/portrait-1200.png`
- Generate: `public/social-card.png`
- Create: `src/assets/portraitAssets.test.ts`

**Interfaces:**
- Consumes: `work/assets/portrait-clean-neutral.png` and the `<picture>` paths from `aboutScene.ts`.
- Produces: deterministic optimized images with fixed 4:5 output dimensions.

- [ ] **Step 1: Copy the approved source portrait into versioned source assets**

Run:

```bash
mkdir -p src/assets/source
cp work/assets/portrait-clean-neutral.png src/assets/source/portrait-clean-neutral.png
```

- [ ] **Step 2: Write the failing asset test**

Create `src/assets/portraitAssets.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const outputs = [
  'public/assets/portrait/portrait-720.avif',
  'public/assets/portrait/portrait-720.webp',
  'public/assets/portrait/portrait-1200.avif',
  'public/assets/portrait/portrait-1200.webp',
  'public/assets/portrait/portrait-1200.png',
];

describe('portrait delivery assets', () => {
  it('creates every declared format with fixed 4:5 dimensions', async () => {
    for (const output of outputs) {
      expect(existsSync(output)).toBe(true);
      const metadata = await sharp(output).metadata();
      expect(metadata.width! / metadata.height!).toBeCloseTo(4 / 5, 2);
    }
  });

  it('creates the 1200 by 630 social card', async () => {
    expect(existsSync('public/social-card.png')).toBe(true);
    const metadata = await sharp('public/social-card.png').metadata();
    expect({ width: metadata.width, height: metadata.height }).toEqual({ width: 1200, height: 630 });
  });
});
```

Run: `npm test -- src/assets/portraitAssets.test.ts`

Expected: FAIL because output assets do not exist.

- [ ] **Step 3: Implement deterministic image generation and wire it into production builds**

Create `scripts/build-assets.mjs`:

```js
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const input = 'src/assets/source/portrait-clean-neutral.png';
const output = 'public/assets/portrait';
await mkdir(output, { recursive: true });

const render = (width, format) => {
  const pipeline = sharp(input).resize(width, Math.round(width * 1.25), { fit: 'cover', position: 'north' });
  if (format === 'avif') return pipeline.avif({ quality: 58, effort: 5 }).toFile(`${output}/portrait-${width}.avif`);
  if (format === 'webp') return pipeline.webp({ quality: 78, effort: 5 }).toFile(`${output}/portrait-${width}.webp`);
  return pipeline.png({ compressionLevel: 9 }).toFile(`${output}/portrait-${width}.png`);
};

await Promise.all([
  render(720, 'avif'),
  render(720, 'webp'),
  render(1200, 'avif'),
  render(1200, 'webp'),
  render(1200, 'png'),
]);

const socialCard = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0c10"/>
  <circle cx="1050" cy="110" r="210" fill="#ff553d"/>
  <text x="70" y="105" fill="#f1eee6" font-family="Arial" font-size="26" font-weight="700">ILYA / WEB DEVELOPER</text>
  <text x="70" y="330" fill="#f1eee6" font-family="Arial" font-size="118" font-weight="900">САЙТЫ,</text>
  <text x="70" y="455" fill="#ff553d" font-family="Arial" font-size="118" font-weight="900">КОТОРЫЕ ПОМНЯТ.</text>
  <text x="74" y="550" fill="#aaa7af" font-family="Arial" font-size="30">DESIGN × CODE × LAUNCH</text>
</svg>`);
await sharp(socialCard).png({ compressionLevel: 9 }).toFile('public/social-card.png');
```

Add these exact entries to the existing `scripts` object in `package.json`:

```json
{
  "assets:build": "node scripts/build-assets.mjs",
  "build": "npm run assets:build && npm run typecheck && vite build"
}
```

- [ ] **Step 4: Build and verify assets**

Run:

```bash
npm run assets:build
npm test -- src/assets/portraitAssets.test.ts
```

Expected: asset build exits 0 and the test PASSes.

- [ ] **Step 5: Commit source and generated assets**

```bash
git add src/assets scripts/build-assets.mjs public/assets/portrait package.json package-lock.json
git commit -m "feat: add responsive portrait asset pipeline"
```

---

### Task 5: Add Scroll-Driven Motion with a Reduced-Motion Fallback

**Files:**
- Create: `src/motion/createMotionController.test.ts`
- Create: `src/motion/createMotionController.ts`
- Modify: `src/main.ts`
- Modify: `src/styles/scenes.css`
- Modify: `src/styles/motion.css`

**Interfaces:**
- Consumes: `[data-scene]`, `[data-transition]`, `[data-rotating-word]`, `[data-about-promise]`, `.about__portrait`, `[data-project-media]`, and project theme classes.
- Produces: `MotionController` with `mount(root: HTMLElement): void` and `destroy(): void`.

- [ ] **Step 1: Write the failing motion lifecycle tests**

Create `src/motion/createMotionController.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createMotionController, type MotionDependencies } from './createMotionController';

const root = document.createElement('div');
root.innerHTML = '<section data-scene="hero"><span data-rotating-word>цепляют.</span></section><div data-transition="route"></div>';

describe('createMotionController', () => {
  it('does not create timelines for reduced-motion users', () => {
    const timeline = vi.fn();
    const dependencies: MotionDependencies = {
      prefersReducedMotion: () => true,
      timeline,
      context: () => ({ revert: vi.fn(), add: vi.fn() }),
    };
    const controller = createMotionController(dependencies);
    controller.mount(root);
    expect(timeline).not.toHaveBeenCalled();
  });

  it('reverts its GSAP context on destroy', () => {
    const revert = vi.fn();
    const dependencies: MotionDependencies = {
      prefersReducedMotion: () => false,
      timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis(), fromTo: vi.fn().mockReturnThis() })),
      context: (setup) => { setup(); return { revert, add: vi.fn() }; },
    };
    const controller = createMotionController(dependencies);
    controller.mount(root);
    controller.destroy();
    expect(revert).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the motion test and verify failure**

Run: `npm test -- src/motion/createMotionController.test.ts`

Expected: FAIL because the controller does not exist.

- [ ] **Step 3: Implement the motion controller**

Create `src/motion/createMotionController.ts`:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type TimelineLike = { to: (...args: unknown[]) => TimelineLike; fromTo: (...args: unknown[]) => TimelineLike };
type ContextLike = { revert: () => void; add: (setup: () => void) => unknown };

export interface MotionDependencies {
  prefersReducedMotion: () => boolean;
  timeline: (options?: object) => TimelineLike;
  context: (setup: () => void, scope?: Element) => ContextLike;
}

export interface MotionController {
  mount(root: HTMLElement): void;
  destroy(): void;
}

const defaultDependencies: MotionDependencies = {
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  timeline: (options) => gsap.timeline(options) as TimelineLike,
  context: (setup, scope) => gsap.context(setup, scope) as unknown as ContextLike,
};

export function createMotionController(dependencies = defaultDependencies): MotionController {
  let context: ContextLike | undefined;
  let mountedRoot: HTMLElement | undefined;
  let wordTimer = 0;

  return {
    mount(root) {
      mountedRoot = root;
      root.removeAttribute('data-motion-ready');
      if (dependencies.prefersReducedMotion()) return;
      root.setAttribute('data-motion-ready', '');

      context = dependencies.context(() => {
        root.querySelectorAll<HTMLElement>('[data-transition]').forEach((bridge) => {
          dependencies.timeline({ scrollTrigger: { trigger: bridge, start: 'top 90%', end: 'bottom 20%', scrub: .7 } })
            .fromTo(bridge.querySelector('strong'), { xPercent: 8 }, { xPercent: -12 });
        });

        root.querySelectorAll<HTMLElement>('[data-project]').forEach((scene) => {
          dependencies.timeline({ scrollTrigger: { trigger: scene, start: 'top 78%', end: 'top 28%', scrub: .6 } })
            .fromTo(scene.querySelector('.case__copy'), { y: 70, opacity: .25 }, { y: 0, opacity: 1 });
        });

        dependencies.timeline({ scrollTrigger: { trigger: '.about', start: 'top 75%', end: 'center 42%', scrub: .6 } })
          .fromTo('[data-about-promise] .about__promise-line > span', { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1 })
          .fromTo('.about__portrait img', { filter: 'grayscale(1)' }, { filter: 'grayscale(0)' }, 0);
      }, root);

      const word = root.querySelector<HTMLElement>('[data-rotating-word]');
      const words = word?.dataset.words?.split('|').filter(Boolean) ?? [];
      let index = 0;
      wordTimer = window.setInterval(() => {
        if (!word || words.length === 0) return;
        index = (index + 1) % words.length;
        word.textContent = words[index] ?? words[0] ?? '';
      }, 1900);
    },
    destroy() {
      if (wordTimer) window.clearInterval(wordTimer);
      context?.revert();
      context = undefined;
      mountedRoot?.removeAttribute('data-motion-ready');
      mountedRoot = undefined;
    },
  };
}
```

- [ ] **Step 4: Mount the controller after semantic rendering**

Append to `src/main.ts`:

```ts
import { createMotionController } from './motion/createMotionController';

const motion = createMotionController();
motion.mount(app);
if (import.meta.hot) import.meta.hot.dispose(() => motion.destroy());
```

In `src/styles/scenes.css`, give rotating words a stable inline block with `min-width: 5.2ch` so text changes do not shift the headline. In `src/styles/motion.css`, ensure only `[data-motion-ready]` elements receive `will-change`.

- [ ] **Step 5: Run unit, type, and reduced-motion browser checks**

Add to `tests/portfolio.spec.ts`:

```ts
test('reduced motion keeps all content visible', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-project]')).toHaveCount(4);
  await expect(page.locator('[data-scene="contact"]')).toBeVisible();
  expect(await page.locator('#app').getAttribute('data-motion-ready')).toBeNull();
  await context.close();
});
```

Run:

```bash
npm test -- src/motion/createMotionController.test.ts
npm run typecheck
npm run e2e
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the motion system**

```bash
git add src/motion src/main.ts src/styles tests/portfolio.spec.ts
git commit -m "feat: add accessible scroll-driven story motion"
```

---

### Task 6: Add Search and Social Metadata

**Files:**
- Create: `src/seo/applyMetadata.test.ts`
- Create: `src/seo/applyMetadata.ts`
- Modify: `src/main.ts`
- Create: `public/favicon.svg`
- Create: `public/robots.txt`

**Interfaces:**
- Consumes: `telegramUrl` and `telegramHandle` from `SiteContent`.
- Produces: `applyMetadata(document: Document, content: SiteContent): void`.

- [ ] **Step 1: Write the failing metadata test**

Create `src/seo/applyMetadata.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteContent } from '../content/siteContent';
import { applyMetadata } from './applyMetadata';

describe('applyMetadata', () => {
  it('sets title, description, social tags, and Person JSON-LD without a fake canonical', () => {
    applyMetadata(document, siteContent);
    expect(document.title).toBe('Илья — веб-разработчик для бизнеса');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('сайты для бизнеса');
    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toMatch(/\/social-card\.png$/);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toMatch(/\/social-card\.png$/);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    const jsonLd = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}');
    expect(jsonLd.sameAs).toEqual(['https://t.me/girtopw']);
  });
});
```

- [ ] **Step 2: Run the metadata test and verify failure**

Run: `npm test -- src/seo/applyMetadata.test.ts`

Expected: FAIL because `applyMetadata.ts` does not exist.

- [ ] **Step 3: Implement metadata creation**

Create `src/seo/applyMetadata.ts`:

```ts
import type { SiteContent } from '../content/siteContent';

const upsertMeta = (document: Document, selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
};

export function applyMetadata(document: Document, content: SiteContent): void {
  const title = 'Илья — веб-разработчик для бизнеса';
  const description = 'Илья лично проектирует и разрабатывает современные сайты для бизнеса — от идеи до запуска.';
  document.title = title;
  upsertMeta(document, 'meta[name="description"]', 'name', 'description', description);
  upsertMeta(document, 'meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta(document, 'meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta(document, 'meta[property="og:type"]', 'property', 'og:type', 'profile');
  upsertMeta(document, 'meta[property="og:image"]', 'property', 'og:image', new URL('/social-card.png', document.location.href).href);
  upsertMeta(document, 'meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  upsertMeta(document, 'meta[name="twitter:image"]', 'name', 'twitter:image', new URL('/social-card.png', document.location.href).href);

  document.head.querySelector('script[data-person-jsonld]')?.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.personJsonld = '';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Илья',
    jobTitle: 'Веб-разработчик',
    sameAs: [content.telegramUrl],
  });
  document.head.append(script);
}
```

Call `applyMetadata(document, siteContent)` in `src/main.ts` before rendering.

- [ ] **Step 4: Add crawler and icon files**

Create `public/robots.txt`:

```text
User-agent: *
Allow: /
```

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <rect width="48" height="48" rx="10" fill="#0c0c10"/>
  <path fill="#ff553d" d="M12 11h7v17l10-17h7v26h-7V20L19 37h-7z"/>
</svg>
```

- [ ] **Step 5: Run metadata and production checks**

Run:

```bash
npm test -- src/seo/applyMetadata.test.ts
npm run build
```

Expected: metadata test PASSes and production build exits 0.

- [ ] **Step 6: Commit metadata**

```bash
git add src/seo src/main.ts public/favicon.svg public/robots.txt
git commit -m "feat: add portfolio search and social metadata"
```

---

### Task 7: Verify Accessibility, Interaction, and Production Quality

**Files:**
- Create: `tests/accessibility.spec.ts`
- Modify: `tests/portfolio.spec.ts`
- Create: `lighthouserc.json`
- Create: `README.md`

**Interfaces:**
- Consumes: the complete production site from Tasks 1–6.
- Produces: repeatable accessibility, browser, build, and Lighthouse quality gates.

- [ ] **Step 1: Write the failing accessibility checks**

Create `tests/accessibility.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard users can reach the Telegram CTA with visible focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus-visible');
  await expect(focused).toBeVisible();
  const focusStyle = await focused.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusStyle).not.toBe('none');
});
```

Run: `npm run e2e -- tests/accessibility.spec.ts`

Expected: FAIL if any semantic, contrast, or focus defect remains.

- [ ] **Step 2: Add interaction and console-error assertions**

Append to `tests/portfolio.spec.ts`:

```ts
test('all primary CTAs are safe Telegram links and the page logs no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const links = page.locator('[data-primary-cta]');
  for (let index = 0; index < await links.count(); index += 1) {
    await expect(links.nth(index)).toHaveAttribute('href', 'https://t.me/girtopw');
    await expect(links.nth(index)).not.toHaveAttribute('target', '_blank');
  }
  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: Fix any concrete accessibility failures**

For each reported axe rule, make the smallest semantic or CSS change that removes that exact violation. Re-run `npm run e2e -- tests/accessibility.spec.ts` after each change. Do not disable axe rules or lower contrast assertions.

Expected: both accessibility tests PASS on mobile and desktop projects.

- [ ] **Step 4: Add enforceable Lighthouse budgets**

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 1,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

- [ ] **Step 5: Document exact local commands**

Create `README.md`:

````md
# Ilya Portfolio

One-page personal portfolio for Ilya, built with Vite, TypeScript, and GSAP.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run test
npm run typecheck
npm run build
npm run e2e
npm run audit
```

The main contact link is `https://t.me/girtopw`. The production domain is intentionally not configured yet.
````

- [ ] **Step 6: Run the full verification suite**

Run:

```bash
npm run test
npm run typecheck
npm run build
npm run e2e
npm run audit
```

Expected:

- all Vitest tests PASS;
- TypeScript exits 0;
- Vite production build exits 0;
- all Playwright tests PASS in mobile and desktop projects;
- Lighthouse meets all four category budgets and CLS ≤0.1;
- no browser console errors are recorded.

- [ ] **Step 7: Visually inspect the production build**

Run `npm run preview -- --port 4173`, then inspect at least:

- 390×844 portrait mobile;
- 844×390 landscape mobile;
- 768×1024 tablet;
- 1440×900 desktop;
- reduced-motion mobile.

Confirm each viewport has no clipped readable content, no horizontal scroll, no overlapping fixed header, legible project visuals, and a visible final Telegram CTA.

- [ ] **Step 8: Commit production verification and documentation**

```bash
git add tests lighthouserc.json README.md src
git commit -m "test: verify portfolio accessibility and production quality"
```

---

### Task 8: Final Repository and Handoff Check

**Files:**
- Modify only files implicated by verification failures.
- No new product scope is introduced in this task.

**Interfaces:**
- Consumes: all code, tests, content, and assets from Tasks 1–7.
- Produces: a clean, reproducible repository ready for deployment after the user supplies or chooses a domain.

- [ ] **Step 1: Verify repository cleanliness and tracked scope**

Run:

```bash
git status --short
git ls-files
```

Expected: no uncommitted source changes; `.superpowers/`, `work/`, `node_modules/`, `dist/`, and test reports are not tracked.

- [ ] **Step 2: Re-run the release gate from a clean install**

Run:

```bash
npm ci
npm run check
npm run audit
```

Expected: all commands exit 0 with the same results as Task 7.

- [ ] **Step 3: Confirm the production artifact contains required pages and assets**

Run:

```bash
test -f dist/index.html
test -f dist/favicon.svg
test -f dist/assets/portrait/portrait-720.avif
test -f dist/assets/projects/pivnoy-doner-desktop-1280.avif
test "$(find dist/assets/projects -type f | wc -l | tr -d ' ')" = "24"
rg -n "girtopw|Пивной Донер|Автошкола|Шаурма Халяль 1|VeachelSell|fastnightshadow-bit" dist
```

Expected: all file checks exit 0, the project asset matrix contains exactly 24 files, and every approved content term is found in the built artifact.

- [ ] **Step 4: Record the final verification commit if cleanup was required**

If Step 1 or 2 required source corrections:

```bash
git add README.md lighthouserc.json package.json package-lock.json playwright.config.ts scripts public src tests
git commit -m "fix: resolve final portfolio verification issues"
```

If no correction was required, do not create an empty commit.
