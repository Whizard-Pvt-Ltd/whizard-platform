# wrcf_Secondary_Work_Object.playwright.spec

**Source:** `manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Secondary Work Object flow, traced to the `SWO` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `SWO-E2E-001` through `SWO-E2E-020`.

## Covered Tests

- `SWO-E2E-001` through `SWO-E2E-020`
- executable coverage includes list visibility, add icon, create popup, mandatory name validation, create, duplicate checks, list refresh, sort order, edit preload, edit validation, unchanged save, update success, parent context, enum values, and delete success
- workbook rows that need downstream mapping or parent-scoped comparison data remain present as pending `fixme` cases with blockers
- full revalidation is still pending; this spec must not be treated as complete again until a fresh execution attempt succeeds or a blocker is documented

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

## Navigation Notes

- Entry page: `Manage Industry WRCF` at `/industry-wrcf`
- Parent selections before SWO actions:
  - Industry Sector
  - Industry
  - Functional Group
  - Primary Work Object
- SWO is managed in the `Secondary Work Obj.` column after a PWO is selected
- Downstream handoff from a selected SWO is:
  - SWO -> Capability -> Proficiency -> Capability Instance mapping
- Delete and dependency assertions depend on the selected PWO/SWO path and any downstream CI or skills data

## Notes

- Uses reusable auth state under `manual-tests/.auth/`
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the SWO case ledger and test-ID source
- Downstream dependency/mapping rows remain pending where the local dataset does not yet prove the rule cleanly
- Adds an explicit local-service readiness check so backend outages fail fast with a documented blocker instead of hanging in login

## Pending Cases And Blockers

- `SWO-E2E-008`
  Blocker: needs a deterministic second PWO context and confirmed parent-scoped uniqueness rule.
- `SWO-E2E-015`
  Blocker: current local SWO delete confirmation behavior has not yet been confirmed as a stable dialog flow.
- `SWO-E2E-017`
  Blocker: needs seeded downstream mapped data and confirmed delete-block behavior.
- `SWO-E2E-020`
  Blocker: needs CI Mapping workflow coverage and stable downstream selection assertions.
- Full suite revalidation
  Blocker: rerun reached the login form with all three local ports reachable, but submit stayed on `Signing in...` and never redirected to `/dashboard` using the current local auth setup and test credentials.
