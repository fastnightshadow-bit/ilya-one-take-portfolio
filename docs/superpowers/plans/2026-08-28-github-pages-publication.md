# GitHub Pages Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the verified portfolio source and an automatically deployed production site from a new public GitHub repository.

**Architecture:** Use Vite's relative base so one production artifact works both locally and below the GitHub project path. Keep public URL ownership in the SEO module, deploy `dist/` through the official Pages Actions artifact flow, and prove path/metadata behavior at the built-output boundary before publishing.

**Tech Stack:** Vite 8, TypeScript, Vitest, Playwright, Lighthouse CI, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-28-github-pages-publication-design.md`

## Global Constraints

- Target repository: `fastnightshadow-bit/ilya-one-take-portfolio`.
- Public URL: `https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/`.
- Never modify the existing `fastnightshadow-bit.github.io` repository.
- Preserve the approved portfolio visuals, motion, content, assets, and external links.
- Keep `dist/` untracked and deploy only a freshly generated artifact.
- Do not weaken any existing test, accessibility, performance, or SEO gate.

---

### Task 1: Make the build portable below a GitHub project path

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/components/aboutScene.ts`
- Modify: `src/components/caseChapter.ts`
- Modify: `src/components/createSite.test.ts`
- Modify: `scripts/verify-dist-seo.mjs`

**Interfaces:**
- Consumes: Vite `base` and existing static HTML renderers.
- Produces: relative build entry URLs and relative public image/favicon URLs.

- [ ] **Step 1: Write failing assertions**

Assert that rendered portrait/project sources start with `./assets/`, and that
the built document has no `src`, `srcset`, or favicon URL beginning at the origin
root.

- [ ] **Step 2: Run focused tests and confirm RED**

Run `npm run test:unit -- src/components/createSite.test.ts` and
`npm run build && npm run verify:dist-seo`. Expected: old `/assets/...` paths fail.

- [ ] **Step 3: Implement the relative path contract**

Set `base: './'`, change renderer-owned public assets to `./assets/...`, and make
the favicon relative while leaving external URLs unchanged.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run the focused unit test, production build, and dist SEO verifier. Expected: all
pass and `dist/index.html` contains no root-only portfolio asset reference.

### Task 2: Publish complete production metadata

**Files:**
- Modify: `src/seo/applyMetadata.ts`
- Modify: `src/seo/applyMetadata.test.ts`
- Modify: `scripts/verify-dist-seo.mjs`
- Create: `public/sitemap.xml`
- Modify: `public/robots.txt`
- Modify: `README.md`

**Interfaces:**
- Consumes: the fixed Pages URL from the publication spec.
- Produces: canonical, `og:url`, absolute social images, JSON-LD `url`, sitemap,
  and crawler instructions.

- [ ] **Step 1: Write failing metadata tests**

Assert one exact canonical, one exact `og:url`, absolute social images, one JSON-LD
portfolio URL, and the sitemap/robots contents.

- [ ] **Step 2: Run focused tests and confirm RED**

Run `npm run test:unit -- src/seo/applyMetadata.test.ts` and the dist verifier.
Expected: production URL metadata and sitemap are missing.

- [ ] **Step 3: Implement the production SEO contract**

Add upsert/render support for canonical and `og:url`, use the absolute social
image URL, include JSON-LD `url`, add the one-page sitemap, update robots, and
document the live target in README.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run unit tests, build, and SEO verification. Expected: all exact URL and
single-owner assertions pass.

### Task 3: Add automatic GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `scripts/release-config.test.mjs`

**Interfaces:**
- Consumes: committed source on remote `main` and the `dist/` build contract.
- Produces: a tested Pages artifact and production deployment URL.

- [ ] **Step 1: Write a failing release configuration test**

Assert that the workflow triggers on `main`, has least-privilege Pages
permissions, runs install/test/build/SEO checks, uploads only `dist/`, and deploys
through the official Pages action.

- [ ] **Step 2: Run the script tests and confirm RED**

Run `npm run test:scripts`. Expected: the missing workflow fails.

- [ ] **Step 3: Add the pinned GitHub Pages workflow**

Create a two-stage-safe deployment job using checkout, setup-node, configure-pages,
upload-pages-artifact, and deploy-pages with immutable action SHAs.

- [ ] **Step 4: Run the script tests and confirm GREEN**

Run `npm run test:scripts`. Expected: workflow coverage passes.

### Task 4: Verify, commit, publish, and inspect production

**Files:**
- Modify: only files required to fix evidence-backed failures.

**Interfaces:**
- Consumes: the completed local HEAD and authenticated GitHub account.
- Produces: remote `main`, public repository URL, green Pages workflow, and live
  public site URL.

- [ ] **Step 1: Run the complete release gate**

Run `npm run check`, `npm audit --omit=dev`, `git diff --check`, and verify a clean
worktree after committing.

- [ ] **Step 2: Create and push the public repository**

Create `fastnightshadow-bit/ilya-one-take-portfolio`, add it as `origin`, and push
the exact local HEAD to remote `main` without rewriting history.

- [ ] **Step 3: Enable and wait for GitHub Pages**

Set Pages source to GitHub Actions, wait for the deployment workflow to finish,
and inspect any failure before retrying.

- [ ] **Step 4: Verify public output**

Require HTTP 200 for the public page, favicon, social card, sitemap, representative
portrait/project assets, and repository URL; inspect the live site at mobile and
desktop widths with zero browser errors or horizontal overflow.
