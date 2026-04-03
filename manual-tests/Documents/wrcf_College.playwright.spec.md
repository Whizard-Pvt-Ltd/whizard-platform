# wrcf_College.playwright.spec

**Source:** `manual-tests/wrcf_College.playwright.spec.ts`

## Purpose

Doc-backed coverage for the `College` tab in `WRCF End-to-End Test Cases_reverified-v2.xlsx`.

## Source Alignment

- Primary document:
  - `temp/College Student Onbaording FS.pdf`
- Workbook ledger:
  - `temp/WRCF End-to-End Test Cases_reverified-v2.xlsx` → `College`
- Latest implementation reference:
  - `/home/sama/repo/whizard-platform/apps/web/admin-portal/src/app/pages/manage-college`
- Runtime truth:
  - `localhost:4200`

## Coverage Strategy

- Stable runnable coverage:
  - `COL-E2E-001` through `COL-E2E-010`
  - These map to the live `Manage College` list/detail/form/preview experience
- Future-authored coverage:
  - `COL-E2E-011` through `COL-E2E-015`
  - `011` and `012` need deterministic save-safe data to verify persisted mapping
  - `013` through `015` depend on a separate Student Onboarding surface described in the FS but not currently exposed in the live admin runtime

## Flow Diagram

```text
Login
  -> open /manage-college
  -> Manage College list/detail view
      -> select college
      -> inspect detail panel
      -> Edit
      -> create/edit college form
          -> Save / Sent to publish / Preview
      -> Preview
          -> Back to Edit
```

## Verified Live Runtime Notes

- `Manage College` currently auto-loads the first available college detail after the list loads
- Search is available through `Search for college...`
- Create/Edit share the same form component
- Current live form enforces:
  - `Name` required
  - `Affiliated University` required
  - `College Type` required
  - `Inquiry Email` email format when populated
- Preview mode is available directly from the form and returns using `Back to Edit`
- The live admin runtime currently does not expose a separate student-onboarding page under `Manage College`

## Future / Blocker Notes

- `COL-E2E-011`, `COL-E2E-012`
  - current UI exposes the relevant controls
  - workbook intent is persistence, not just presence
  - these need a deterministic save-safe record to avoid mutating shared data while validating linkage
- `COL-E2E-013` through `COL-E2E-015`
  - documented in the FS as Student Onboarding at College
  - no matching live admin page/module was found during generation
