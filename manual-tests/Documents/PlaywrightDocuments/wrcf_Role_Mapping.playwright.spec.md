# wrcf_Role_Mapping.playwright.spec

**Source:** `manual-tests/wrcf_Role_Mapping.playwright.spec.ts`

## Purpose

PDF-backed coverage for WRCF Role Mapping, traced to the `Role Mapping` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `RMAP-E2E-001` through `RMAP-E2E-015`.

## Covered Tests

- `RMAP-E2E-001` through `RMAP-E2E-015`
- current stable runnable coverage focuses on the workbook-valid negative gate that mappings remain unavailable until a role is selected
- remaining workbook rows are authored in the same spec and currently fail with explicit blocker messages because they need seeded role data, a working role-save path, or workbook/UI reconciliation

## Flow Diagram

```text
Login
  -> open /wrcf-roles
  -> select Industry
  -> select Department
  -> observe Role filter and Mappings action
      -> if a role exists, Mappings opens Manage CI Mappings dialog
      -> dialog groups pending role mappings by PWO and allows save/remove
```

## Navigation Notes

- Entry page: `Manage WRCF Roles` at `/wrcf-roles`
- Workbook intent is `Industry -> Department -> Role -> Mapping`
- Live UI exposes a `Mappings` button that opens the `Manage CI Mappings` dialog
- The dialog shows:
  - Industry / Department / Role context as read-only labels
  - grouped pending mappings by `PWO`
  - per-row remove action
  - save button disabled when no pending mappings exist

## Current UI / Runtime Notes

- The live page now keeps the mapping action unavailable until a role is explicitly selected, which aligns with the workbook gate for `RMAP-E2E-002`.
- The dialog itself is still a pending-mapping review/save layer; it does not directly render “all existing mappings” in the workbook’s phrasing without first having the right seeded role/mapping state.
- Current local runtime still inherits the open Roles blocker where role save does not complete reliably, so many role-mapping cases cannot yet establish the selected-role prerequisite in a deterministic way.

## Stable vs Future

- stable:
  - `RMAP-E2E-002`
- future-authored with explicit blockers:
  - `RMAP-E2E-001`, `RMAP-E2E-003` through `RMAP-E2E-015`

## Blocker Summary

- `RMAP-E2E-001`, `RMAP-E2E-003`
  - blocked by current Roles save/runtime issue before a selected role can be established
- `RMAP-E2E-004` through `RMAP-E2E-014`
  - need a deterministic selected role plus working role-mapping save/remove runtime
- `RMAP-E2E-015`
  - needs a Viewer or Auditor account
