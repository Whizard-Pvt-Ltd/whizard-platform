# wrcf_Task.playwright.spec

**Source:** `manual-tests/wrcf_Task.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Task flow, traced to the `Task` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `TSK-E2E-001` through `TSK-E2E-014`.

## Covered Tests

- `TSK-E2E-001` through `TSK-E2E-014`
- stable runnable coverage currently targets the lowest-cost task checks: add-icon visibility, create-popup visibility, mandatory-field validation, and valid-save behavior
- future workbook rows remain authored in the same spec file under `@future` instead of permanent `fixme`
- runtime/data blockers are tracked separately from `@future` coverage through explicit failure messages and blocker tags

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> select Industry Sector
  -> select Industry
  -> select FG
  -> select PWO
  -> select SWO
  -> select Capability
  -> ensure a Capability Instance exists by saving a proficiency selection if needed
  -> open Mappings
  -> click Skill+ on a saved CI row
  -> open /wrcf-skills?capabilityInstanceId=...
  -> select existing Skill or create one if none exists
  -> inspect Task column behavior
      -> add / validate / save / edit / delete
```

## Notes

- Reuses the WRCF auth pattern, but now drives the parent workflow through a selected Capability Instance instead of probing `industryId` routes
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` (`UC-04 Manage Skills`, `UC-04.2 Create Task`) and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the case ledger and test-ID source
- Depends first on a selected saved Capability Instance in `Manage Industry WRCF`, then on `Manage WRCF Skills`, then on a selected Skill before any Task CRUD behavior can execute
- The spec now creates the minimum parent prerequisites when missing:
  - saves a CI from the selected FG/PWO/SWO/Capability/Proficiency path if needed
  - creates a Skill if the selected CI has no Skill rows yet

## Pending Cases And Blockers

- Stable default cases:
  - `TSK-E2E-001` through `TSK-E2E-004`
  - Tags: `@stable @p0 @task`
  - These run in the default Playwright flow and should fail normally if the parent CI workflow, `Manage WRCF Skills` handoff, or selected Skill context is broken.
- Future-authored cases:
  - `TSK-E2E-005` through `TSK-E2E-014`
  - Tags: `@future` plus priority and blocker tags
  - These stay visible in the same spec and are excluded only from the default run.
- Current runtime/data blockers:
  - parent blocker: current local workflow may fail to create or reuse a selected Capability Instance and enter `Manage WRCF Skills` through `Skill+`
  - local blocker: no deterministic selected Skill row may exist after CI selection, even after the spec attempts to create one
  - data blocker: duplicate/edit/delete cases may need existing task rows or child control points
