# wrcf_Skills.playwright.spec

**Source:** `manual-tests/wrcf_Skills.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Skills flow, traced to the `Skills` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `SKL-E2E-001` through `SKL-E2E-015`.

## Covered Tests

- `SKL-E2E-001` through `SKL-E2E-015`
- executable coverage currently targets the lowest-cost skill checks: add-icon visibility, create-popup visibility, mandatory-field validation, and valid-save behavior
- workbook rows that require a resolved CI parent context, seeded skill rows, seeded child tasks, or stable delete/edit runtime remain explicit pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> discover an industryId that can open /wrcf-skills
  -> select FG
  -> select PWO
  -> select SWO
  -> select Capability
  -> select Proficiency
  -> inspect Skills column behavior
      -> add / validate / save / edit / delete
```

## Notes

- Reuses the `Manage WRCF Skills` guarded auth and parent-context discovery pattern instead of assuming the page is always runnable
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` (`UC-04 Manage Skills`, `UC-04.1 Create Skill`) and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the case ledger and test-ID source
- Depends on the parent `Manage WRCF Skills` runtime being able to resolve a valid Capability Instance context before any skill CRUD behavior can execute cleanly

## Pending Cases And Blockers

- `SKL-E2E-001`, `SKL-E2E-003`, `SKL-E2E-004`, `SKL-E2E-005`
  Blocker when skipped: current local environment exposes sectors and industries, but no discovered `industryId` loads Manage WRCF Skills with Functional Group options.
- `SKL-E2E-002`
  Blocker: needs a deterministic existing selected skill row so the edit icon can be asserted reliably.
- `SKL-E2E-006`, `SKL-E2E-007`
  Blocker: need stable duplicate validation under a valid CI path with an existing skill.
- `SKL-E2E-008`, `SKL-E2E-009`
  Blocker: need a valid CI path plus stable observable create/close behavior in the local runtime.
- `SKL-E2E-010`, `SKL-E2E-011`, `SKL-E2E-012`, `SKL-E2E-015`
  Blocker: need a deterministic existing skill row and stable edit-panel access.
- `SKL-E2E-013`
  Blocker: needs a seeded skill with child tasks plus dependency-block behavior.
- `SKL-E2E-014`
  Blocker: needs a childless skill plus stable delete-confirmation flow.
