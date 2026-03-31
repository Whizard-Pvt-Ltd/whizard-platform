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
### Pending
- Manage WRCF Skills
- Skills
- Task
- Control Point
- Roles
- Role Mapping
- Companies

### Recommended Next Target
- PWO revalidation, then SWO revalidation, then Manage WRCF Skills

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

## Pending Clarifications
- None yet
