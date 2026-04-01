# CODEX Progress Log

## Purpose
This file is the running memory for Codex work in this repo.
Use it to preserve continuity across sessions, prevent repeated mistakes, and track what is done next.

## Current Status

### Completed
- [x] Dashboard
- [x] Manage WRCF
- [x] Functional Group


### Needs revalidation / regeneration
- [ ] PWO
- [ ] SWO
### Generated but blocked on backend validation
- [x] CI Mapping
### Generated but blocked on local Manage Skills data/runtime
- [x] Manage WRCF Skills
- [x] Skills
### Generated but blocked on environment validation
- [x] Task
### Pending
- Control Point
- Roles
- Role Mapping
- Companies

### Recommended Next Target
- Control Point after frontend/WRCF runtime is available again

## Reusable Working Notes

### What to Reuse First
- Closest existing spec as template
- Existing naming conventions
- Existing describe/test organization
- Existing pending-case style
- Existing companion markdown style

### What Wastes Time
- Rebuilding full context every session
- Re-reading all PDFs for every sheet
- Over-validating already repeated UI patterns
- Generating without running
- Repeating previously solved fixes

## Reusable Failure Patterns

### Known Patterns
- None yet

## Session Log
Add one entry after each meaningful generation/run/debug cycle.

- 2026-03-31: Identified workbook sheet inventory from the `.xlsx` zip payload because `openpyxl` is unavailable in this shell. Generated `wrcf_CI_Mapping.playwright.spec.ts` plus companion markdown using the existing WRCF sheet-driven pattern. Recommended next workbook target after CI Mapping is `Manage WRCF Skills` because it follows directly from saved CI state and reuses the current hierarchy context.
- 2026-03-31: Bootstrapped the workspace with `corepack pnpm install --frozen-lockfile` and attempted to run `wrcf_CI_Mapping.playwright.spec.ts`. Result: Playwright loaded the spec successfully, but `beforeAll` timed out during login because `http://localhost:4200/login` was reachable while backend ports `http://localhost:3000` and `http://localhost:3001` were timing out.
- 2026-03-31: Status corrected so PWO and SWO are treated as needing revalidation/regeneration rather than completed coverage. Reviewed both specs/docs and regenerated them to fail fast on local backend readiness instead of hanging during login.
- 2026-03-31: Re-executed `wrcf_Primary_Work_Object.playwright.spec.ts` and `wrcf_Secondary_Work_Object.playwright.spec.ts` after regeneration. Current blocker is no longer raw port availability: `localhost:4200`, `localhost:3000`, and `localhost:3001` all respond, but login stays on `/login` with the submit button in `Signing in...` state, so both suites remain in revalidation status.
- 2026-03-31: Corrected WRCF source hierarchy in repo memory/docs. `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf` are now treated as the product source of truth; `temp/WRCF End-to-End Test Cases_reverified.xlsx` is documented as the derived test-case ledger generated from those PDFs.
- 2026-03-31: Updated `wrcf_Manage_WRCF_Skills.playwright.spec.ts` to choose a sector/industry combination that actually contains Functional Group data before using `+ Add Skills`, instead of blindly taking the first visible filter values.
- 2026-03-31: Executed focused `WSKILL-E2E-003`, `WSKILL-E2E-004`, and `WSKILL-E2E-006` plus the full `wrcf_Manage_WRCF_Skills.playwright.spec.ts` suite. Result: 10 cases skipped with documented blockers. The local environment exposes sectors/industries on `/industry-wrcf`, but no discovered `industryId` loads `/wrcf-skills` with Functional Group filter options, so executable manage-skills cases are currently gated as environment/data blockers instead of failing in `beforeEach`.
- 2026-03-31: Generated `wrcf_Skills.playwright.spec.ts` plus companion markdown from the `Skills` workbook tab, using the WRCF PDFs for product intent and the workbook as the case ledger. Executed a focused pass (`SKL-E2E-001`, `003`, `004`, `005`) and the full suite. Result: 4 skipped in the focused run and 15 skipped in the full run, all cleanly gated by the parent `Manage WRCF Skills` context blocker or by seeded-skill/task data requirements.
- 2026-04-01: Generated `wrcf_Task.playwright.spec.ts` plus companion markdown from the `Task` workbook tab, using the WRCF PDFs for product intent and the workbook as the case ledger. Attempted a focused pass (`TSK-E2E-001` through `004`) and the full suite. Current blocker is earlier than task-context validation: frontend preflight to `http://localhost:4200/login` timed out, so the suite is recorded as generated but blocked on environment validation.
- 2026-04-01: Introduced tag-based stable-vs-future Playwright execution. Added repo-level default exclusion for `@future`, scripts for stable, future, and stable `@p0` coverage, tagged a stable dashboard slice, and converted `wrcf_Task.playwright.spec.ts` away from `fixme`-driven future coverage. Stable Task cases (`TSK-E2E-001` through `004`) now fail normally on real runtime/data issues; future Task coverage (`TSK-E2E-005` through `014`) remains visible under `@future`.

## Pending Clarifications
- None yet
