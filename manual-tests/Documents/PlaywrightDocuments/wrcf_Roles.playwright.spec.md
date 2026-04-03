# wrcf_Roles.playwright.spec

**Source:** `manual-tests/wrcf_Roles.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Roles flow, traced to the `Roles` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `ROLE-E2E-001` through `ROLE-E2E-012`.

## Covered Tests

- `ROLE-E2E-001` through `ROLE-E2E-012`
- stable runnable coverage currently targets industry-to-department loading, add/edit role action visibility, create-role flow, update-role flow, and delete-action visibility
- rows that need alternative seeded departments, dependency-linked mappings, or lower-privilege users remain authored in the same spec file under `@future`

## Flow Diagram

```text
Login
  -> open /wrcf-roles
  -> wait for Industry options
  -> use selected/default Industry context
  -> wait for Department options
  -> select Department when needed
  -> observe Role dropdown and role actions
  -> use Add / Edit split-button actions
      -> create role
      -> update role
      -> inspect delete action
```

## Notes

- Reuses the shared WRCF auth/service-readiness pattern from the existing workbook-driven specs
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` (`UC-07 Manage Roles`) and the WRCF workbook ledger
- Uses the current `Manage WRCF Roles` page rather than the Skills-style hierarchy pages; this module is centered on `Industry -> Department -> Role`
- The page auto-selects the first available industry and first department on load, which affects how some workbook scenarios can be exercised
- Current local runtime has no seeded department options in the available industry contexts on first load, so the strict department-loading check can fail while later role behaviors create a temporary department prerequisite.
- Current local runtime opens the role create form, but role save does not complete within the expected window and leaves the panel open without a visible validation message; downstream edit/delete role checks therefore inherit a real role-save blocker rather than a missing-default cascade.

## Verified Accuracy Notes

- The workbook’s `Manage Roles` flow is valid, but the current UI is dropdown/split-action based rather than column-add/edit based.
- The workbook mentions role description in create/edit data, but the current Role panel HTML does not expose a description field even though the model and API support it.
- The role panel currently enforces:
  - `Name`
  - `Seniority Level`
  as required fields for save.
- Because the page auto-selects the first department after industry load, the workbook’s “industry selected; no department selected” state is not currently a stable default UI state.

## Pending Cases And Blockers

- Stable default cases:
  - `ROLE-E2E-001`, `ROLE-E2E-004` through `ROLE-E2E-010`
  - Tags: `@stable` with `@p0/@p1/@p2` and `@roles`
- Future-authored cases:
  - `ROLE-E2E-002`, `ROLE-E2E-003`, `ROLE-E2E-011`, `ROLE-E2E-012`
  - `ROLE-E2E-002` needs at least two departments with different role sets
  - `ROLE-E2E-003` conflicts with the current auto-select-first-department behavior
  - `ROLE-E2E-011` needs a deterministic role with capability-instance mappings
  - `ROLE-E2E-012` needs a Viewer/Auditor account
