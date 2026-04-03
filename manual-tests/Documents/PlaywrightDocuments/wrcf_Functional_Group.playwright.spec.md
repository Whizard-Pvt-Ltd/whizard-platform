# wrcf_Functional_Group.playwright.spec

**Source:** `manual-tests/wrcf_Functional_Group.playwright.spec.ts`

## Purpose

Sheet-driven Functional Group coverage aligned to the FG tab in `WRCF End-to-End Test Cases.xlsx`, especially the `G` steps and `H` expected results.

## Covered Tests

- `FG-E2E-001` through `FG-E2E-025`
- now includes the previously missing sort-order and edit-popup rows:
  - `FG-E2E-014` sort order
  - `FG-E2E-015` edit icon visibility
  - `FG-E2E-016` edit popup title
  - `FG-E2E-017` edit preload
  - `FG-E2E-018` edit actions

## Flow Diagram

```text
Login
  -> reuse saved auth state when available
  -> /industry-wrcf
  -> select sector
  -> select industry
  -> observe Functional Group list for that selected context
  -> Functional Group column
      -> open add panel
      -> create / validate / cancel
      -> select FG
          -> edit / save / delete
          -> if needed create child PWO to validate delete dependency block
```

## Navigation Notes

- Entry page: `Manage Industry WRCF` at `/industry-wrcf`
- Parent selections before Functional Group actions:
  - Industry Sector
  - Industry
- Setup rule:
  - FG tests should first open `Manage Industry WRCF`, then explicitly select sector and industry, then validate the Functional Group list for that chosen context.
  - They should not keep hopping across multiple sector/industry combinations looking for data.
- Functional Group is the first hierarchy column under the selected industry context
- Downstream handoff from a selected FG is:
  - FG -> PWO -> SWO -> Capability -> Proficiency
- FG tests only exercise the first hierarchy layer and create child PWO data only when needed for delete-dependency coverage

## Current Run Summary

- Current ordered run artifact: [wrcf-functional-group-results.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-functional-group-results.md)
- Current ordered CSV artifact: [wrcf-functional-group-results.csv](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-functional-group-results.csv)

## Failed Or Blocked Cases

- `FG-E2E-009` duplicate on add
  Blocker: duplicate FG creation does not surface the expected validation/error banner in the current build.
- `FG-E2E-010` trim-aware duplicate handling
  Blocker: duplicate FG creation with trailing spaces does not surface the expected validation/error banner in the current build.
- `FG-E2E-019` edit validation
  Blocker: duplicate validation on edit does not surface the expected validation/error banner in the current build.
- `FG-E2E-025` validation and success feedback behavior
  Blocker: expected validation/error banner and toast feedback are not consistently surfaced by the current UI flow.

## Notes

- Uses a reusable Playwright auth state file under `manual-tests/.auth/`.
- Runs tests independently so failures remain failed while later FG cases continue to execute.
