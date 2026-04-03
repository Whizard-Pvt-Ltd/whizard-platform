# wrcf_Companies.playwright.spec

**Source:** `manual-tests/wrcf_Companies.playwright.spec.ts`

## Purpose

Workbook-backed coverage for the `Companies` tab in `WRCF End-to-End Test Cases_reverified.xlsx`.

## Source Alignment

- The main WRCF functional PDF does not currently describe a `Companies` module.
- The workbook does contain `COMP-E2E-001` through `COMP-E2E-019`.
- The live runtime at `/manage-company` is a `Manage Company` CRUD page with:
  - company list
  - selected-company detail panel
  - create/edit form
  - preview mode
- The workbook scenarios mostly describe a future company-WRCF dashboard / override / upgrade surface that is not present in the current live UI.

## Coverage Strategy

- Stable current-runtime baseline:
  - `COMP-CUR-001` through `COMP-CUR-006`
  - These validate the real live `Manage Company` page:
    - page load
    - list search
    - create form open
    - required-name validation
    - edit prefill
    - preview flow
    - invalid email validation
- Workbook-authored future coverage:
  - `COMP-E2E-001` through `COMP-E2E-019`
  - These remain authored in the same spec as `@future`
  - They execute and fail with explicit blocker messages because the described company-WRCF versioning/override flows are not present in the current UI

## Flow Diagram

```text
Login
  -> open /manage-company
  -> Manage Company list/detail view
      -> select existing company
      -> inspect detail panel
      -> Edit
      -> create/edit company form
          -> Save / Send to publish / Preview
      -> Preview
          -> Back
```

## Stable Current-Runtime Notes

- `Manage Company` currently auto-selects the first company after the list loads
- Search filters the left list panel client-side
- Create/Edit share the same form component
- Form currently enforces:
  - `Name` required
  - `inquiryEmail` email format when populated
- Preview currently works from edit mode because it depends on an existing selected company

## Workbook/Future Blockers

- The live page does not expose:
  - Company WRCF dashboard
  - Industry Version / Company Version / Overrides count
  - Structural / Capability / Role override sections
  - Company role adjustments
  - Upgrade Available / Upgrade & Merge flows
- Role-based workbook cases also need dedicated accounts not currently provided in this suite:
  - Company Admin
  - Industry Architect
  - Auditor
  - Employee

## Recommended Interpretation

- Treat the stable `COMP-CUR-*` cases as the truthful baseline for the current live `Manage Company` implementation
- Treat `COMP-E2E-*` rows as future-state workbook coverage pending delivery of the company-WRCF dashboard/override/versioning module
