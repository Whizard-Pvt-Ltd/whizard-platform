# manage-company.playwright.spec

**Source:** `manual-tests/manage-company.playwright.spec.ts`

## Purpose

Current-runtime Playwright coverage for the live `Manage Company` CRUD page on local.

## Source Alignment

- The current local page at `/manage-company` is a CRUD workspace.
- It exposes:
  - company list or empty state
  - search
  - add flow
  - company form
- It does not attempt to validate the larger workbook `COMP-E2E-*` company-WRCF dashboard / override / upgrade flows.

## Coverage Strategy

- `MNG-COM-001`
  - listing loads
- `MNG-COM-002`
  - search filters list when data exists, otherwise validates empty-state safely
- `MNG-COM-003`
  - Add opens the create form with the expected actions and sections
- `MNG-COM-004`
  - details plus media upload remain associated while switching tabs
- `MNG-COM-005`
  - preview-before-save path
- `MNG-COM-006`
  - save a valid company
- `MNG-COM-007`
  - new company appears in listing after save
- `MNG-COM-008`
  - send to publish for a completed company
- `MNG-COM-009`
  - save is blocked when mandatory details are missing
- `MNG-COM-010`
  - save should remain blocked when mandatory media is missing
- `MNG-COM-011`
  - publish remains blocked for an incomplete form
- `MNG-COM-012`
  - inquiry email validation works
- `MNG-COM-013`
  - future-year validation
- `MNG-COM-014`
  - unsupported file types should be rejected by upload
- `MNG-COM-015`
  - files above the 2MB client-side limit are rejected
- `MNG-COM-016`
  - create API failures keep form data and show an error
- `MNG-COM-017`
  - upload API failures keep form data and show an error
- `MNG-COM-018`
  - repeated save clicks should not create duplicate requests
- `MNG-COM-019`
  - max-length name at the accepted boundary can still be submitted
- `MNG-COM-020`
  - over-limit names should be blocked
- `MNG-COM-021`
  - description max-length enforcement
- `MNG-COM-022`
  - file size at the limit is accepted; above the limit is rejected
- `MNG-COM-023`
  - long-text and no-match search handling
- `MNG-COM-024`
  - tab switching retains draft form state

## Recommended Interpretation

- Use this spec as the truthful current baseline for the `Manage Company` workbook sheet on local.
- Some cases are expected to fail today because the current runtime does not enforce the workbook expectation yet, for example:
  - preview before save
  - publish completion behavior
  - future-year blocking
  - media-required blocking
  - duplicate-save prevention
  - over-limit text blocking
- Keep `wrcf_Companies.playwright.spec.ts` for workbook/future company-WRCF coverage until that larger module exists in the runtime.
