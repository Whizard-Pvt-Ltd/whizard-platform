# wrcf_Primary_Work_Object.playwright.spec

**Source:** `manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts`

## Purpose

Sheet-aligned coverage for the `PWO` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `PWO-E2E-001` through `PWO-E2E-020`.

## Covered Tests

- `PWO-E2E-001` through `PWO-E2E-020`
- executable coverage includes list visibility, add icon, create popup, mandatory/default fields, create, duplicate checks, list refresh, sort order, edit preload, edit validation, unchanged save, update success, parent context, enum values, and delete success
- workbook rows that need extra seeded data or confirmed downstream behavior remain present as pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> confirm default sector + industry
  -> select Functional Group
  -> Primary Work Obj. column
      -> open add panel
      -> create / validate / close
      -> select PWO
          -> edit / save / delete
```

## Notes

- Uses reusable auth state under `manual-tests/.auth/`
- Uses only the `temp` workbook as the source for the PWO case list
- Parent-scoped uniqueness and dependency-heavy rows remain pending where the local dataset does not prove the rule cleanly

## Pending Cases And Blockers

- `PWO-E2E-008`
  Blocker: needs a deterministic second FG context and confirmed parent-scoped uniqueness rule.
- `PWO-E2E-015`
  Blocker: current local PWO delete confirmation behavior has not yet been confirmed as a stable dialog flow.
- `PWO-E2E-017`
  Blocker: needs a PWO with a child SWO plus confirmed delete-block behavior.
- `PWO-E2E-020`
  Blocker: needs confirmed `Dependency Links` field presence in the local PWO popup.
