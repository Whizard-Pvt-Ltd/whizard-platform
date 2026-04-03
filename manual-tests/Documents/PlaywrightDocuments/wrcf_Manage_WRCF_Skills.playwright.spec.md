# wrcf_Manage_WRCF_Skills.playwright.spec

**Source:** `manual-tests/wrcf_Manage_WRCF_Skills.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Manage Skills flow, traced to the `Manage WRCF Skills` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `WSKILL-E2E-001` through `WSKILL-E2E-010`.

## Covered Tests

- `WSKILL-E2E-001` through `WSKILL-E2E-010`
- executable coverage currently includes CI-backed filter population, dropdown ordering, skills-page resolution for a selected CI path, and stale-state reset when the top CI filters change
- workbook rows that depend on full CI redirect inheritance, auto-selected defaults, or richer seeded skills/task/control-point data remain explicit pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> select CI in Manage Industry WRCF
     FG -> PWO -> SWO -> Capability -> Proficiency
  -> open Manage WRCF Skills
     current UI supports:
       + Add Skills -> /wrcf-skills?industryId=...
       Skill+ in Mappings -> /wrcf-skills?capabilityInstanceId=...
  -> resolve selected CI context on Manage WRCF Skills
  -> inspect Skills / Task / Control Point behavior
```

## Notes

- Reuses the WRCF auth pattern and live industry selection flow from the existing WRCF specs
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the case ledger and test-ID source, while keeping unsupported PDF/workbook expectations visible as pending blockers
- Focuses this first pass on page-level filter behavior and CI-path resolution before the deeper skill/task/control-point CRUD sheets
- Workbook intent is CI-first: a selected Capability Instance in Manage Industry WRCF should scope Manage WRCF Skills
- Current UI has two different entry mechanics, which is part of the present mismatch:
  - `+ Add Skills` carries only `industryId`
  - `Skill+` in `Manage CI Mappings` carries `capabilityInstanceId`
- Local execution has shown that the `industryId` path is not sufficient for stable CI-scoped CRUD coverage, so downstream suites are being re-aligned around the selected-CI `Skill+` workflow

## Pending Cases And Blockers

- `WSKILL-E2E-001`
  Blocker: workbook expects the selected CI to carry forward, but current `+ Add Skills` navigation only carries `industryId`; the more faithful current UI path is `Skill+` from `Manage CI Mappings`.
- `WSKILL-E2E-002`, `WSKILL-E2E-005`
  Blocker: current page does not auto-select all 5 CI filters on direct open without a `ciId` query param.
- `WSKILL-E2E-003`, `WSKILL-E2E-004`, `WSKILL-E2E-006`, `WSKILL-E2E-010`
  Blocker: current local environment exposes sectors and industries, but no discovered `industryId` loads Manage WRCF Skills with Functional Group filter options.
- `WSKILL-E2E-007`
  Blocker: needs a deterministic CI path with seeded skills and tasks under multiple skills.
- `WSKILL-E2E-008`
  Blocker: needs seeded control point data under at least one selected task plus comparison data.
- `WSKILL-E2E-009`
  Blocker: needs stable seeded rows in all three columns for edit-icon visibility coverage.
