# GitHub Pages Publication Design

## Goal

Publish the completed portfolio as a public source repository at
`fastnightshadow-bit/ilya-one-take-portfolio` and serve the production build at
`https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/` without changing
the approved design, content, motion, or project links.

## Repository and hosting

- Create a new public repository named `ilya-one-take-portfolio` in the
  `fastnightshadow-bit` account. The existing `fastnightshadow-bit.github.io`
  repository is out of scope and must not be modified.
- Publish the current feature HEAD as remote `main`; keep the local linked
  worktree and feature branch intact.
- Deploy `dist/` with the official GitHub Pages Actions flow. `dist/` remains
  ignored and is produced in CI from committed source.
- Every push to `main` reruns tests, builds the static site, verifies production
  SEO, and deploys the resulting artifact.

## Path strategy

- Vite uses the relative public base `./`. This keeps local preview working at
  the origin root while making generated JS, CSS, fonts, and CSS images resolve
  under the GitHub project path.
- HTML strings produced by the static renderer use relative public asset paths
  (`./assets/...` and `./favicon.svg`) because Vite cannot rewrite those strings.
- External project, Telegram, and GitHub links remain absolute and unchanged.

## Public SEO contract

- Canonical URL and `og:url` are exactly
  `https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/`.
- Open Graph and Twitter images use the absolute URL
  `https://fastnightshadow-bit.github.io/ilya-one-take-portfolio/social-card.png`.
- Person JSON-LD includes the public portfolio URL.
- `sitemap.xml` contains the one canonical URL; the project-level `robots.txt`
  allows crawling and points to that sitemap.
- SEO verification rejects missing, duplicate, relative, or stale production
  metadata and asserts the deployed asset files exist.

## Quality and safety

- Add failing tests before path and metadata implementation.
- The built `dist/index.html` must not contain root-only portfolio asset URLs.
- Unit, script, type, production E2E, accessibility, responsive, SEO, Lighthouse,
  dependency audit, and browser smoke checks must remain green.
- Publication is complete only after the repository, Pages workflow, deployed
  site, static assets, and workflow run are verified through their public URLs.
