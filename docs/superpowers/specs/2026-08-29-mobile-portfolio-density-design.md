# Mobile Portfolio Density Design

**Status:** Approved by the user on 2026-08-29 through explicit instruction to implement and publish.

## Goal

Polish only the phone layout of Ilya's portfolio so the opening screen feels intentional and full-screen, project chapters are dense and memorable rather than empty, and the published Telegram chapter, GitHub strip, final handoff, and contact chapter remain unchanged.

## Scope boundary

- The redesign applies only at viewport widths up to and including `700px`.
- Tablet and desktop behavior from `701px` upward must remain unchanged.
- The existing portrait visibility fix in commit `8450a6f` remains included.
- No new dependencies, screenshots, content sources, routes, or project links are introduced.
- The existing project order and six running-text handoffs remain.

## Immutable published region

The Telegram chapter and everything after it are frozen to the currently published implementation:

- `[data-scene="telegram-shop"]`
- `.github-strip`
- the `message-to-contact` / `.bridge--final` handoff
- `[data-scene="contact"]`
- Telegram project copy, action URL, screenshot, layout, colors, shadows, authored rotation, and motion behavior

Implementation must not add or change mobile rules targeting `.case--telegram`, `.github-strip`, `.bridge--final`, or `.contact`. Shared rules may only be changed when an automated regression proves that the frozen region's computed mobile presentation remains unchanged.

## Mobile opening screen

- The hero occupies the complete usable phone screen: `100svh` minus the actual sticky mobile header height (`61px` in the current published layout).
- Metadata stays at the top, the main copy and CTA are centered vertically in the remaining area, and the first running-text strip begins immediately after the hero.
- The decorative ghost `01` and vertical `SCROLL TO TRANSFORM` label are hidden on phones so the height reads as intentional rather than empty.
- The rotating headline, description, CTA destination, and existing motion logic are preserved.
- The copy-to-CTA gap remains at least `24px`.

## Mobile About chapter

- About changes from a `1240px` absolute-positioned composition to a compact two-column chapter in normal grid flow.
- Copy and portrait sit side by side; the portrait shows Ilya's clothing as well as his face and remains loaded from the existing responsive assets.
- The three trust facts move into a compact two-column grid below the copy/portrait row; the final fact spans both columns.
- No element is positioned hundreds of pixels away from its semantic neighbor, and the chapter has no fixed or artificial minimum height.

## Mobile project chapters

### Pivnoy Doner

- Copy is vertically centered in the left column.
- Only the mobile proof is visible on phone widths; the desktop proof remains in the DOM and remains visible at `701px` and above.
- The phone is large in the right column with a subtle positive rotation, matching the successful mobile composition used for Driving School.
- The complete phone remains inside the chapter and its bottom stays visible without recreating the previous large beige void.
- The headline is reduced enough that `Из локального места` never overlaps either proof.
- The existing project action remains a visible, styled, at-least-`44px` target.

### Driving School

- Copy is vertically centered in the left column.
- Only the mobile proof is visible on phone widths; the desktop proof remains in the DOM and remains visible at `701px` and above.
- The phone receives a subtle authored tilt.
- The yellow `Открыть сайт` action remains visible, styled, and at least `44px` in both dimensions.
- Copy remains the existing approved content: headline, description, and link destination do not change.

### Shaurma Halal 1

- The existing two-column structure and single phone proof remain.
- Only typography and copy alignment change: the copy is vertically centered and the headline is small enough to form two meaningful groups, `Заказ еды` and `с телефона.`, instead of one-word lines.
- The phone proof, its authored rotation, the action destination, and the chapter structure are unchanged.

## Mobile running-text handoffs

- Existing handoff dimensions and motion remain unchanged.
- The handoff between Driving School and Shaurma uses the existing phrase `ROAD → MOBILE → MENU → ORDER` on a black background, as explicitly requested.
- That color override is scoped by the exact `road-to-phone` transition data attribute; it must not change the incoming Telegram handoff.
- The final handoff after Telegram remains unchanged.
- Handoffs must remain horizontally clipped with no page overflow.

## Motion

- No new phone animation is introduced.
- Existing GSAP behavior remains unchanged.
- Desktop motion and all desktop project compositions remain unchanged.
- `prefers-reduced-motion: reduce` continues to show every final composition without transforms or hidden content.

## Verification requirements

- New Playwright expectations are written and observed failing before production CSS changes.
- Verify at `390×844`, `360×800`, `700×900`, `701×900`, and `1440×900`.
- At `390×844`, verify intentional hero height and centering, compact About flow, Doner mobile-only non-overlapping composition, School mobile-only proof and action, Shaurma meaningful wrapping, and no horizontal overflow.
- Characterize and preserve the Telegram chapter's mobile computed presentation before the redesign.
- At `701px` and `1440px`, verify both Driving School proofs remain visible and existing desktop hierarchy still passes.
- Run unit tests, type checking, production build, complete Playwright suite, SEO verifier, and Lighthouse through the existing `npm run check` workflow.
- Perform visual inspection in the browser at phone and desktop sizes.

## Publication

- Commit the mobile redesign together with the already verified portrait fix.
- Push the finished branch to the public repository's `main` branch only after the full verification succeeds.
- Confirm the GitHub Pages deployment and provide the public portfolio URL.
