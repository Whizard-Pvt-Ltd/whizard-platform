# wrcf_Primary_Work_Object.playwright.spec

**Source:** `manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Primary Work Object flow, traced to the `PWO` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `PWO-E2E-001` through `PWO-E2E-020`.

## Covered Tests

- `PWO-E2E-001` through `PWO-E2E-020`
- executable coverage includes list visibility, add icon, create popup, mandatory/default fields, create, duplicate checks, list refresh, sort order, edit preload, edit validation, unchanged save, update success, parent context, enum values, and delete success
- workbook rows that need extra seeded data or confirmed downstream behavior remain present as pending `fixme` cases with blockers
- full revalidation is still pending; this spec must not be treated as complete again until a fresh execution attempt succeeds or a blocker is documented

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

## Navigation Notes

- Entry page: `Manage Industry WRCF` at `/industry-wrcf`
- Parent selections before PWO actions:
  - Industry Sector
  - Industry
  - Functional Group
- PWO is managed in the `Primary Work Obj.` column after an FG is selected
- Downstream handoff from a selected PWO is:
  - PWO -> SWO -> Capability -> Proficiency
- Delete and parent-scope assertions depend on the currently selected FG context

## Notes

- Uses reusable auth state under `manual-tests/.auth/`
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the PWO case ledger and test-ID source
- Parent-scoped uniqueness and dependency-heavy rows remain pending where the local dataset does not prove the rule cleanly
- Adds an explicit local-service readiness check so backend outages fail fast with a documented blocker instead of hanging in login

## Pending Cases And Blockers

- `PWO-E2E-008`
  Blocker: needs a deterministic second FG context and confirmed parent-scoped uniqueness rule.
- `PWO-E2E-010`
  Blocker: current branch data renders the PWO list in a non-alphabetical order, so the workbook ordering expectation is a known product/data gap for now.
- `PWO-E2E-015`
  Blocker: current local PWO delete confirmation behavior has not yet been confirmed as a stable dialog flow.
- `PWO-E2E-017`
  Blocker: needs a PWO with a child SWO plus confirmed delete-block behavior.
- `PWO-E2E-020`
  Blocker: needs confirmed `Dependency Links` field presence in the local PWO popup.
- Full suite revalidation
  Blocker: rerun reached the login form with all three local ports reachable, but submit stayed on `Signing in...` and never redirected to `/dashboard` using the current local auth setup and test credentials.
