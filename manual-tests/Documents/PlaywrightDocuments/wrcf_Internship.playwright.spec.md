# wrcf_Internship.playwright.spec

**Source:** `manual-tests/wrcf_Internship.playwright.spec.ts`

## Purpose

Doc-backed coverage for the `Internship` tab in `WRCF End-to-End Test Cases_reverified-v2.xlsx`.

## Source Alignment

- Primary document:
  - `temp/Internship SRS.pdf`
- Workbook ledger:
  - `temp/WRCF End-to-End Test Cases_reverified-v2.xlsx` -> `Internship`
- Latest code reference:
  - `/home/sama/repo/whizard-platform`
- Runtime truth:
  - `localhost:4200`

## Coverage Strategy

- All current `INT-E2E-*` cases are authored as `@future`
- This is intentional because the Internship SRS describes a dedicated module and multiple screens, but the current live admin runtime does not expose an Internship page, route, or execution workflow
- The spec exists now so workbook traceability is preserved and future implementation can move from blocker coverage to runnable coverage without starting from scratch

## Flow Diagram

```text
Login
  -> expected future Internship surface
      -> Manage Internship
      -> Create Internship
      -> Screening Criteria
      -> Assessment
      -> Interview
      -> Final Selection
      -> Internship Offer
      -> During Internship
      -> Weekly Schedule
      -> Internship Logbook
      -> Completion / Certification
```

## Verified Runtime And Code Notes

- The current live admin runtime on `localhost:4200` does not expose a dedicated Internship route
- The latest admin code reference does not contain an Internship page/module comparable to `manage-company` or `manage-college`
- The word `Internship` currently appears only as a label/chip/contact-role reference in adjacent modules, not as a standalone implemented workflow
- A broader backend/bounded-context reference for `internship-hiring` exists in the repo, but it is not currently surfaced through a runnable admin UI/module that matches the SRS screens

## Retag Review

- Rechecked all current `INT-E2E-*` future cases against:
  - `temp/Internship SRS.pdf`
  - live runtime on `localhost:4200`
  - latest code reference at `/home/sama/repo/whizard-platform`
- Result:
  - no current `INT-E2E-*` case is implemented enough to move from `@future` to runnable coverage yet
  - some supporting concepts exist in adjacent modules or backend/domain references, but the SRS-defined Internship screens and workflows are still not exposed as an executable admin module

## Workbook / SRS Mapping

- `INT-E2E-001` to `INT-E2E-005`
  - internship creation and publish lifecycle
- `INT-E2E-006` to `INT-E2E-012`
  - screening, assessment, interview, selection, and offer flow
- `INT-E2E-013` to `INT-E2E-019`
  - execution, evidence validation, weekly tracking, logbook, review, and certification

## Current Blocker

- The Internship module described by `temp/Internship SRS.pdf` is not currently exposed in the live admin runtime
- Because no runnable Internship UI exists yet, the authored Playwright cases fail with explicit blocker messages rather than silent skip/fixme handling

## Recommended Next Step

- When the Internship module appears on `localhost:4200`, reclassify the relevant cases from `@future` to runnable coverage in layers:
  1. Manage Internship / Create Internship
  2. Screening / Assessment / Interview / Offer
  3. During Internship / Weekly Schedule / Logbook / Certification
