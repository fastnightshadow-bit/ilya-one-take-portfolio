# Selected Story Transitions Implementation Plan

**Status:** Superseded by the user's 2026-08-28 decision to restore the compact running-text bridges from `a14fd3c`. This plan remains as implementation history only.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six abstract bridge illustrations with the exact selected content-driven transition sequence, including the approved T1 clean poster takeover.

**Architecture:** Keep the existing semantic scene order, typed content source, renderer boundary, GSAP lifecycle, and progressive-enhancement model. Give every bridge a stable `kind`, `from`, and `to`; render one focused composition per kind; drive its three motion layers through one scrubbed timeline while preserving the adjacent real-scene handoff.

**Tech Stack:** Vite, strict TypeScript, semantic HTML, CSS, GSAP/ScrollTrigger, Vitest/jsdom, Playwright, axe-core, Lighthouse CI.

**Spec:** `docs/superpowers/specs/2026-08-28-selected-story-transitions-design.md`

## Global Constraints

- Use exactly: `ticker-to-about`, `personal-to-poster`, `clean-takeover`, `road-to-phone`, `phone-to-telegram`, `message-to-contact`.
- The third bridge is the approved T1 clean takeover; do not substitute D, D1, split shutters, 3D, or camera fly-through.
- Preserve all seven scenes, four real project chapters, verified destinations, GitHub strip, portrait, CTA, SEO, and asset contracts.
- Bridges remain decorative, non-interactive, fully visible without JavaScript, static under reduced motion, and free of horizontal overflow.
- Use `apply_patch` for source edits and follow RED → GREEN → REFACTOR.

---

### Task 1: Lock the selected transition contract

**Files:**
- Modify: `src/content/siteContent.test.ts`
- Modify: `src/components/createSite.test.ts`
- Modify: `src/motion/createMotionController.test.ts`
- Modify: `tests/portfolio.spec.ts`
- Modify: `tests/accessibility.spec.ts`

**Interfaces:**
- Produces: the literal six-item `kind/from/to` acceptance matrix and observable motion/fallback contracts.
- Consumes: current render and motion public DOM attributes.

- [ ] **Step 1: Write failing unit tests**

Assert the literal matrix:

```ts
[
  ['ticker-to-about', 'hero', 'about'],
  ['personal-to-poster', 'about', 'pivnoy-doner'],
  ['clean-takeover', 'pivnoy-doner', 'driving-school'],
  ['road-to-phone', 'driving-school', 'shaurma-mobile'],
  ['phone-to-telegram', 'shaurma-mobile', 'telegram-shop'],
  ['message-to-contact', 'telegram-shop', 'contact'],
]
```

Require each bridge to expose its kind/from/to, one source layer, one target layer, and one morph layer; require no old variant names.

- [ ] **Step 2: Run unit tests and verify RED**

Run: `npm test -- src/content/siteContent.test.ts src/components/createSite.test.ts src/motion/createMotionController.test.ts`

Expected: FAIL because the current content and DOM still expose `portrait…final` and no `from/to` contract.

- [ ] **Step 3: Write failing browser contracts**

Update the transition suite to assert the literal matrix, substantial geometry at 390×844 and 1440×900, source/target/morph movement during scroll, decorative semantics, reduced-motion stability, no-JS completeness, and no overflow.

- [ ] **Step 4: Run focused production E2E and verify RED**

Run: `npm run build && npx playwright test -c playwright.prod.config.ts tests/portfolio.spec.ts tests/accessibility.spec.ts --grep "transition|reduced motion|static story"`

Expected: FAIL on the old transition vocabulary and composition contract.

### Task 2: Render the selected compositions

**Files:**
- Modify: `src/content/siteContent.ts`
- Modify: `src/components/transitionBridge.ts`
- Modify: `src/styles/transitions.css`

**Interfaces:**
- Consumes: `TransitionContent { kind, from, to }` from `siteContent.ts`.
- Produces: six decorative bridge roots with `data-transition`, `data-transition-from`, `data-transition-to`; each includes `[data-transition-source]`, `[data-transition-target]`, and `[data-transition-morph]`.

- [ ] **Step 1: Replace the typed content vocabulary**

Define the six exact kind literals, `SceneId`, and a literal six-item transition array matching Task 1.

- [ ] **Step 2: Render six focused artworks**

Implement the moving row, `ЛИЧНО.` → Doner poster, T1 Doner → School takeover, road → phone, Shaurma phone → Telegram phone, and message → coral contact compositions. Decorative project images use `alt=""`.

- [ ] **Step 3: Replace bridge CSS**

Remove all old `portrait/brand/route/mobile/chat/final` selectors. Style complete static compositions, then add only small motion-ready setup rules where necessary. Keep bridge height around `52–62svh`, pointer events disabled, and mobile layouts inside the viewport.

- [ ] **Step 4: Run unit render/content tests and verify GREEN**

Run: `npm test -- src/content/siteContent.test.ts src/components/createSite.test.ts`

Expected: PASS.

### Task 3: Drive each approved transformation

**Files:**
- Modify: `src/motion/createMotionController.ts`
- Test: `src/motion/createMotionController.test.ts`

**Interfaces:**
- Consumes: the three bridge layer hooks and exact transition kind.
- Produces: one scrubbed transition timeline per bridge plus the existing adjacent-scene handoff and exact teardown restoration.

- [ ] **Step 1: Replace old art configs with six selected configs**

For every kind, provide responsive `from/to` values for source, target, and morph. `clean-takeover` expands the red poster layer to cover the stage before the school target appears; other configs express the single transformation named by the kind.

- [ ] **Step 2: Update selectors and snapshot ownership**

Replace `[data-transition-accent]` with `[data-transition-morph]` everywhere in setup and authored-style restoration without changing the robust context teardown behavior.

- [ ] **Step 3: Run motion tests and verify GREEN**

Run: `npm test -- src/motion/createMotionController.test.ts`

Expected: PASS with six bridge timelines, four project-copy timelines, one About timeline, no resources in reduced motion, and exact style restoration on destroy/setup failure.

### Task 4: Fix portrait visibility/crop and Shaurma media density

**Files:**
- Modify: `tests/portrait-layout.spec.ts`
- Modify: `src/components/createSite.test.ts`
- Modify: `src/components/caseChapter.ts`
- Modify: `src/styles/scenes.css`
- Modify: `tests/portfolio.spec.ts`

**Interfaces:**
- Produces: an About portrait visible after the real CTA jump at `844×390`, at least 90% vertical source visibility at wide viewports, and one decorative real-screen detail in the Shaurma media composition on tablet/desktop.
- Consumes: existing `.about__portrait`, `caseChapter(ProjectContent)`, and the generated Shaurma WebP asset.

- [ ] **Step 1: Write failing portrait regression tests**

At `844×390`, click `Смотреть дальше ↓` and require the portrait to intersect the viewport by at least 96px. At `1920×1080` and `2560×1440`, derive the visible vertical source fraction from the container, image natural dimensions, and `object-fit: cover`; require at least `0.9`.

- [ ] **Step 2: Write the failing Shaurma density contract**

Require exactly one `[data-project-detail]` in the Shaurma scene, none in other scenes, visibility on desktop, and a combined detail/phone footprint that uses at least 55% of the media area without crossing its bounds. Require the detail to be hidden at 390px.

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `npm test -- src/components/createSite.test.ts && npm run build && npx playwright test -c playwright.prod.config.ts tests/portrait-layout.spec.ts tests/portfolio.spec.ts --grep "portrait|Shaurma"`

Expected: FAIL because the landscape portrait is below the viewport, the wide crop fraction is too low, and the Shaurma detail does not exist.

- [ ] **Step 4: Implement the root-cause fixes**

Cap the desktop portrait width to a value compatible with its 720px height, anchor it from the top on short landscape viewports, and keep the current mobile arrangement. Add a non-semantic `.case__detail` element only for the `mobile` theme and render the existing `shaurma-mobile-mobile-390.webp` as its CSS background; overlap it with a slightly larger full phone on wider layouts and hide it below 701px.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run the same command from Step 3 and expect PASS.

### Task 5: Production verification and visual QA

**Files:**
- Verify: `src/`
- Verify: `tests/`
- Verify: `dist/`

**Interfaces:**
- Consumes: the completed selected transition system.
- Produces: verified production artifact and clean worktree commit.

- [ ] **Step 1: Run focused browser tests**

Run: `npm run build && npx playwright test -c playwright.prod.config.ts tests/portfolio.spec.ts tests/accessibility.spec.ts`

Expected: all tests pass in both configured projects, with the intentional desktop-only skip unchanged.

- [ ] **Step 2: Inspect the live production result**

Check 390×844 and 1440×900 around all six transition midpoints. Confirm T1 matches the saved demo, compositions stay inside bounds, and no old abstract line/portrait/frame art remains.

- [ ] **Step 3: Run the complete release gate**

Run: `npm run check`

Expected: unit tests, Node tests, build, production E2E, and Lighthouse all pass existing thresholds.

- [ ] **Step 4: Request independent review and fix valid findings**

Review the scoped diff against `docs/superpowers/specs/2026-08-28-selected-story-transitions-design.md`, then rerun affected tests after any fix.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-08-28-selected-story-transitions-design.md docs/superpowers/plans/2026-08-28-selected-story-transitions.md src tests
git commit -m "fix: restore selected portfolio transitions"
```

### Task 6: Prepare the GitHub upload

**Files:**
- Verify: `.git/config`
- Verify: tracked source and generated public assets

**Interfaces:**
- Consumes: the reviewed release commit from Task 5.
- Produces: a clean branch ready for a new or existing GitHub remote.

- [ ] **Step 1: Confirm repository state**

Run: `git status --short && git log -1 --oneline && git remote -v`

Expected: clean worktree and the reviewed release commit; if no remote exists, prepare a repository named `ilya-portfolio` under `fastnightshadow-bit`.

- [ ] **Step 2: Verify that private and generated-local files are excluded**

Run: `git status --ignored --short`

Expected: `.superpowers/`, `dist/`, dependencies, reports, and local test output remain ignored, while `public/assets/portrait/` and `public/assets/projects/` are tracked delivery assets.

- [ ] **Step 3: Stop at the external side-effect boundary**

Immediately before creating or pushing the GitHub repository, identify the destination, visibility, and uploaded personal material (source code, public Telegram handle, portfolio copy, project screenshots, and portrait) and obtain the required action-time confirmation if the chosen upload mechanism requires it.

- [ ] **Step 4: Push the reviewed branch**

Add the exact confirmed remote and push `feat/ilya-one-take-portfolio`, then verify the remote branch commit equals local `HEAD`. Do not merge or enable public hosting unless separately authorized.
