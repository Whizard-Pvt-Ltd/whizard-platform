# wrcf_Secondary_Work_Object.playwright.spec

**Source:** `manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts`

## Purpose

Sheet-aligned coverage for the `SWO` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `SWO-E2E-001` through `SWO-E2E-020`.

## Covered Tests

- `SWO-E2E-001` through `SWO-E2E-020`
- executable coverage includes list visibility, add icon, create popup, mandatory name validation, create, duplicate checks, list refresh, sort order, edit preload, edit validation, unchanged save, update success, parent context, enum values, and delete success
- workbook rows that need downstream mapping or parent-scoped comparison data remain present as pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> confirm default sector + industry
  -> select Functional Group
  -> select Primary Work Obj.
  -> Secondary Work Obj. column
      -> open add panel
      -> create / validate / close
      -> select SWO
          -> edit / save / delete
```

## Notes

- Uses reusable auth state under `manual-tests/.auth/`
- Uses only the `temp` workbook as the source for the SWO case list
- Downstream dependency/mapping rows remain pending where the local dataset does not yet prove the rule cleanly

## Pending Cases And Blockers

- `SWO-E2E-008`
  Blocker: needs a deterministic second PWO context and confirmed parent-scoped uniqueness rule.
- `SWO-E2E-015`
  Blocker: current local SWO delete confirmation behavior has not yet been confirmed as a stable dialog flow.
- `SWO-E2E-017`
  Blocker: needs seeded downstream mapped data and confirmed delete-block behavior.
- `SWO-E2E-020`
  Blocker: needs CI Mapping workflow coverage and stable downstream selection assertions.
