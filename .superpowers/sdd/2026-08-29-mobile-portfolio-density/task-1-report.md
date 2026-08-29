# Task 1 Report: Lock the immutable Telegram and desktop contracts

## Status

DONE_WITH_CONCERNS

## Files changed

- `tests/mobile-layout.spec.ts`
- `docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md`
- `docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md`

## Commands and exact results

1. Read requirements and mandatory workflow references:
   - `sed -n '1,260p' .superpowers/sdd/2026-08-29-mobile-portfolio-density/task-1-brief.md`
   - `sed -n '1,220p' ~/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/using-superpowers/SKILL.md`
   - `sed -n '1,220p' ~/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/using-superpowers/references/codex-tools.md`
   - `sed -n '1,360p' ~/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/test-driven-development/SKILL.md`
   - `sed -n '1,240p' ~/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/test-driven-development/writing-good-tests.md`
   - `sed -n '1,260p' package.json`
   - `sed -n '1,260p' src/components/caseChapter.ts`
   - `sed -n '1,260p' tests/portfolio.spec.ts`
   - `sed -n '1,260p' tests/portrait-layout.spec.ts`
   - `sed -n '1,240p' tests/accessibility.spec.ts`
   - Result: confirmed exact Task 1 scope, existing semantic selectors, Playwright `mobile` project, and required commit targets.

2. Initial Playwright attempt before escalation:
   - `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile`
   - Result: failed before test execution because the sandbox blocked the web server bind.
   - Exact failure:

```text
> ilya-one-take-portfolio@1.0.0 e2e
> playwright test tests/mobile-layout.spec.ts --project=mobile

[WebServer] error when starting dev server:
[WebServer] Error: listen EPERM: operation not permitted 0.0.0.0:4173
Error: Process from config.webServer was not able to start. Exit code: 1
```

3. Characterization verification after adding `tests/mobile-layout.spec.ts` and allowing local server startup:
   - `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile`
   - Exit code: `0`
   - Exact result:

```text
> ilya-one-take-portfolio@1.0.0 e2e
> playwright test tests/mobile-layout.spec.ts --project=mobile

Running 2 tests using 1 worker

  ✓  1 [mobile] › tests/mobile-layout.spec.ts:23:1 › published Telegram mobile presentation remains unchanged (389ms)
  ✓  2 [mobile] › tests/mobile-layout.spec.ts:52:1 › mobile polish leaves the 1440 project hierarchy unchanged (119ms)

  2 passed (1.3s)
```

4. Self-review checks:
   - `git diff -- tests/mobile-layout.spec.ts docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md`
   - `git status --short`
   - Result: only the intended new test plus the required plan/spec docs were staged for commit; no production code changed.

5. Commit:
   - `git add tests/mobile-layout.spec.ts docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md`
   - `git commit -m "test: lock published mobile presentation"`
   - Result:

```text
[feat/ilya-one-take-portfolio bfa46ae] test: lock published mobile presentation
 3 files changed, 672 insertions(+)
 create mode 100644 docs/superpowers/plans/2026-08-29-mobile-portfolio-density.md
 create mode 100644 docs/superpowers/specs/2026-08-29-mobile-portfolio-density-design.md
 create mode 100644 tests/mobile-layout.spec.ts
```

6. Post-commit confirmation:
   - `git rev-parse HEAD`
   - Result: `bfa46ae46d2fd6ebf0a80b9c9fee2dc3ec0248e5`
   - `git status --short`
   - Result: clean worktree.

## Baseline check

- The Telegram mobile presentation baseline from the brief already matched the current published-equivalent implementation exactly:
  - background `rgb(213, 240, 235)`
  - layout columns `2`
  - gap `12px`
  - `align-items: center`
  - headline size `39`
  - CTA background `rgb(11, 87, 208)`
  - CTA text `rgb(255, 255, 255)`
  - phone shadow `rgb(11, 87, 208) 9px 10px 0px 0px`
  - phone angle close to `1.5deg`

## Self-review

- The new helper uses only existing semantic selectors from `caseChapter.ts`, so later CSS work can change layout while preserving a stable DOM contract.
- The Telegram test asserts behavior, not source text, and the expectations are hand-authored literals rather than values computed by the implementation under test.
- The desktop-preservation test follows the brief exactly and verifies both Driving School proofs plus the frozen Telegram alignment/background contract.
- No production source, content, motion logic, or published styles were modified in Task 1.

## Commit SHA

`bfa46ae46d2fd6ebf0a80b9c9fee2dc3ec0248e5`

## Concerns

- This was a pure characterization task, so the new spec passed immediately against existing behavior; there was no meaningful RED caused by missing production implementation.
- The required Playwright run needed elevated execution because the sandbox blocked Vite from listening on `0.0.0.0:4173`.
- The test output included existing `NO_COLOR`/`FORCE_COLOR` warnings from the runtime environment; they did not affect pass/fail, but the output was not perfectly pristine.

---

## Fix Round 1

### Status

DONE

### Files changed

- `tests/mobile-layout.spec.ts`

### Commands and exact results

1. Re-read the task context and current report:
   - `sed -n '1,260p' .superpowers/sdd/2026-08-29-mobile-portfolio-density/task-1-brief.md`
   - `sed -n '1,260p' .superpowers/sdd/2026-08-29-mobile-portfolio-density/task-1-report.md`
   - `sed -n '1,260p' ~/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/receiving-code-review/SKILL.md`
   - Result: confirmed both findings were technically correct and required stronger regression contracts in `tests/mobile-layout.spec.ts`, without production edits.

2. Inspect the current implementation and existing test:
   - `rg -n "github-strip|bridge--final|message-to-contact|data-scene=\"contact\"|case__layout|driving-school|telegram-shop" src`
   - `sed -n '1,240p' tests/mobile-layout.spec.ts`
   - `git status --short`
   - Result: verified the current guard only covered Telegram plus minimal desktop visibility, which matched the review findings.

3. Capture the public-equivalent baselines used for the new hand-authored expectations:
   - `npm run dev -- --port 4173`
   - `node --input-type=module -e "...mobile baseline capture script..."`
   - `node --input-type=module -e "...desktop baseline capture script..."`
   - Result: collected exact computed style/geometry values for `.github-strip`, `[data-transition="message-to-contact"]`, `[data-scene="contact"]`, and 1440px Doner/School/Telegram layouts from the current implementation. The browser capture commands required elevated execution for local Chromium.

4. Covering verification after strengthening the regression contract:
   - `npm run e2e -- tests/mobile-layout.spec.ts --project=mobile`
   - Exit code: `0`
   - Exact result:

```text
> ilya-one-take-portfolio@1.0.0 e2e
> playwright test tests/mobile-layout.spec.ts --project=mobile


Running 2 tests using 1 worker

(node:61796) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 [mobile] › tests/mobile-layout.spec.ts:185:1 › published Telegram mobile presentation and frozen post-Telegram tail remain unchanged (329ms)
  ✓  2 [mobile] › tests/mobile-layout.spec.ts:329:1 › mobile polish leaves the 1440 project hierarchy unchanged (125ms)

  2 passed (936ms)
```

5. Self-review checks before commit:
   - `git diff -- tests/mobile-layout.spec.ts`
   - `git status --short`
   - Result: only `tests/mobile-layout.spec.ts` changed in this fix round; no production code, content, or docs were modified.

6. Commit:
   - `git add tests/mobile-layout.spec.ts .superpowers/sdd/2026-08-29-mobile-portfolio-density/task-1-report.md`
   - `git commit -m "test: strengthen mobile layout regression guard"`
   - Result: see commit SHA below.

### Self-review

- The first finding is now covered by explicit mobile computed-style and geometry baselines for `.github-strip`, the final `message-to-contact` strip, and `[data-scene="contact"]`, so broad mobile selectors that accidentally alter the frozen tail should now break the guard.
- The second finding is now covered by stronger 1440px contract assertions for Doner, School, and Telegram using computed grid, spacing, padding, shadows, rotations, and key geometry values instead of visibility-only checks or screenshot goldens.
- Expectations are hand-authored from the current public-equivalent implementation and assert rendered behavior, not source text.
- I intentionally did not address the minor `.split(' ')` fragility, per instruction; it remains for the later review ledger.

### Commit SHA

`PENDING`

### Concerns

- The strengthened characterization still depends on exact computed values for the current rendering engine, so it is intentionally stricter than a semantic-only smoke test.
- The verification output still contains the existing runtime `NO_COLOR` warning, but the test result itself is clean.
