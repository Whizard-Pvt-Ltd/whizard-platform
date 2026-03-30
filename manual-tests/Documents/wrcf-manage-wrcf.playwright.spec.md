# wrcf-manage-wrcf.playwright.spec

**Source:** `manual-tests/wrcf-manage-wrcf.playwright.spec.ts`

## Purpose

Sheet-aligned coverage for the `Manage WRCF` tab in `WRCF End-to-End Test Cases.xlsx`, covering `MIWRCF-E2E-001` through `MIWRCF-E2E-036`.

## Covered Tests

- `MIWRCF-E2E-001` through `MIWRCF-E2E-036`
- executable coverage now includes page load, default sector/industry state, dropdown ordering, FG list visibility/sorting, PWO/SWO column loading, capability visibility, proficiency ordering, and selection persistence
- workbook rows that require DB comparison, alternate roles, apply-button behavior, or special seeded data are present as explicit pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> default Industry Sector + Industry load
  -> verify filter state and column visibility
  -> Functional Group column
      -> select FG
          -> Primary Work Obj. column
              -> select PWO
                  -> Secondary Work Obj. column
                      -> inspect Capabilities
                      -> inspect Proficiency Level
```

## Notes

- Uses the live WRCF UI
- Full sheet ID coverage is present even when some rows are still blocked by environment or product prerequisites
- Uses pending `fixme` tests to keep blocked workbook rows visible in the report count

## Pending Cases And Blockers

- `MIWRCF-E2E-007`, `MIWRCF-E2E-031`
  Blocker: the current local UI does not expose a stable Apply-button workflow to verify separately.
- `MIWRCF-E2E-018` through `MIWRCF-E2E-025`, `MIWRCF-E2E-032`, `MIWRCF-E2E-033`, `MIWRCF-E2E-036`
  Blocker: these rows require seeded CI marking data or DB-backed validation.
- `MIWRCF-E2E-026` through `MIWRCF-E2E-029`
  Blocker: these rows require special empty-state or tenant-isolation fixtures that are not present in the local dataset.
- `MIWRCF-E2E-030`
  Blocker: requires a lower-privilege user account.
- `MIWRCF-E2E-034`
  Blocker: requires a high-volume dataset and explicit performance thresholds.
