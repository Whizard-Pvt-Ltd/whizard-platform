# wrcf_Task.playwright.spec

**Source:** `manual-tests/wrcf_Task.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Task flow, traced to the `Task` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `TSK-E2E-001` through `TSK-E2E-014`.

## Covered Tests

- `TSK-E2E-001` through `TSK-E2E-014`
- executable coverage currently targets the lowest-cost task checks: add-icon visibility, create-popup visibility, mandatory-field validation, and valid-save behavior
- workbook rows that require a resolved parent CI context, a selected skill row, seeded task rows, or seeded control points remain explicit pending `fixme` cases with blockers

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
  -> select Skill
  -> inspect Task column behavior
      -> add / validate / save / edit / delete
```

## Notes

- Reuses the guarded parent-context discovery pattern from `wrcf_Manage_WRCF_Skills.playwright.spec.ts` and `wrcf_Skills.playwright.spec.ts`
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` (`UC-04 Manage Skills`, `UC-04.2 Create Task`) and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the case ledger and test-ID source
- Depends first on the parent `Manage WRCF Skills` runtime and then on a selected skill row before any task CRUD behavior can execute

## Pending Cases And Blockers

- `TSK-E2E-001`, `TSK-E2E-002`, `TSK-E2E-003`, `TSK-E2E-004`
  Blocker when skipped: current local environment exposes sectors and industries, but no discovered `industryId` loads Manage WRCF Skills with Functional Group options, or no deterministic skill row exists after CI selection.
- `TSK-E2E-005`, `TSK-E2E-006`
  Blocker: need an existing task under a selected skill plus stable duplicate validation.
- `TSK-E2E-007`
  Blocker: needs stable create-panel close behavior under a selected skill context.
- `TSK-E2E-008`, `TSK-E2E-009`, `TSK-E2E-010`
  Blocker: need a deterministic existing task row and stable task edit panel access.
- `TSK-E2E-011`
  Blocker: needs a task with child control points plus dependency-block behavior.
- `TSK-E2E-012`
  Blocker: needs a childless task plus stable delete-confirmation behavior.
- `TSK-E2E-013`
  Blocker: needs confirmed required-proficiency validation behavior from the current runtime and backend.
- `TSK-E2E-014`
  Blocker: needs successful task save coverage to verify optional standard duration behavior.
