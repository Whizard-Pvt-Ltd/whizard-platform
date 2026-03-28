# wrcf_Functional_Group.playwright.spec

**Source:** `manual-tests/wrcf_Functional_Group.playwright.spec.ts`

## Purpose

Sheet-driven Functional Group coverage aligned to the FG tab in `WRCF End-to-End Test Cases.xlsx`, especially the `G` steps and `H` expected results.

## Covered Tests

- `FG-E2E-001` list view for the selected sector and industry context
- `FG-E2E-002` add icon visibility
- `FG-E2E-003` add popup opening
- `FG-E2E-004` popup title
- `FG-E2E-005` mandatory name with optional description and domain type
- `FG-E2E-006` 50-char accepted and 51-char blocked boundary check
- `FG-E2E-007` create with minimal data
- `FG-E2E-008` blank-name validation
- `FG-E2E-009` duplicate on add
- `FG-E2E-010` trim-aware duplicate handling
- `FG-E2E-011` special character handling
- `FG-E2E-012` cancel add
- `FG-E2E-013` add refresh
- `FG-E2E-019` edit validation
- `FG-E2E-020` unchanged edit save
- `FG-E2E-021` update success
- `FG-E2E-022` delete confirmation
- `FG-E2E-023` delete success without child PWO
- `FG-E2E-024` delete dependency block when PWO exists
- `FG-E2E-025` validation and success feedback behavior

## Flow Diagram

```text
Login
  -> reuse saved auth state when available
  -> /industry-wrcf
  -> select sector + industry with visible FG rows
  -> Functional Group column
      -> open add panel
      -> create / validate / cancel
      -> select FG
          -> edit / save / delete
          -> if needed create child PWO to validate delete dependency block
```

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
