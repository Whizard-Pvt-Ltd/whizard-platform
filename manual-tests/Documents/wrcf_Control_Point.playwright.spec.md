# wrcf_Control_Point.playwright.spec

**Source:** `manual-tests/wrcf_Control_Point.playwright.spec.ts`

## Purpose

PDF-backed coverage for the WRCF Control Point flow, traced to the `Control Point` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `CP-E2E-001` through `CP-E2E-014`.

## Covered Tests

- `CP-E2E-001` through `CP-E2E-014`
- stable runnable coverage currently targets terminology, add-icon visibility, create-popup visibility, required-save blocking, and valid-save behavior
- later duplicate, edit, delete, and enum-boundary rows remain authored in the same spec file under `@future`
- runtime/data blockers are tracked separately from `@future` coverage through explicit failure messages and blocker notes

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> select Industry Sector
  -> select Industry
  -> click + Add Skills
  -> open /wrcf-skills
  -> select FG
  -> select PWO
  -> select SWO
  -> select Capability
  -> select Proficiency
  -> select existing Skill or create one if none exists
  -> select existing Task or create one if none exists
  -> inspect Control Point column behavior
      -> add / validate / save / edit / delete
```

## Notes

- Reuses the WRCF auth pattern and the current `+ Add Skills` navigation path that already works for the fixed `Task` suite
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` (`UC-04 Manage Skills`, `UC-04.3 Create Control Point`, `Flow -Skill/Task/Control Point (Add / Edit)`) and `temp/WRCF definition & Schema.pdf`
- Uses the workbook as the case ledger and test-ID source
- Depends first on a selected sector/industry in `Manage Industry WRCF`, then on `Manage WRCF Skills`, then on a selected Skill and selected Task before any Control Point CRUD behavior can execute
- The spec creates the minimum parent prerequisites when missing:
  - creates a Skill if the selected CI has no Skill rows yet
  - creates a Task if the selected Skill has no Task rows yet

## Verified Accuracy Notes

- The current UI and runtime use `Control Point` terminology in the column and create panel, so `CP-E2E-001` is treated as runnable stable coverage instead of a pending naming-gap row.
- The current panel visibly marks these fields as required:
  - `Name`
  - `Risk Level`
  - `Failure Impact Type`
  - `Escalation Required`
  - `Evidence Type`
- However, the current component save guard only blocks on:
  - `Name`
  - `Risk Level`
  - `Failure Impact Type`
- The current `ControlPointItem` model also exposes:
  - `name`
  - `description`
  - `riskLevel`
  - `failureImpactType`
  - `kpiThreshold`
  - `escalationRequired`
  and does not clearly surface `evidenceType`.
- Because of that mismatch, `CP-E2E-004` is kept as a truthful stable validation check against the currently enforced save rule, while `CP-E2E-014` stays `@future` pending clearer source/runtime alignment for the full enum set.

## Pending Cases And Blockers

- Stable default cases:
  - `CP-E2E-001` through `CP-E2E-005`
  - Tags: `@stable` with `@p0/@p1` and `@control-point`
  - These run in the default Playwright flow and should fail normally if the parent workflow, selected task context, or current Control Point behavior is broken.
- Future-authored cases:
  - `CP-E2E-006` through `CP-E2E-014`
  - Tags: `@future` plus priority and blocker tags
  - These stay visible in the same spec and are excluded from the default run unless explicitly requested.
- Current runtime/data blockers:
  - parent blocker: local runtime still depends on the `+ Add Skills` path fully resolving all five skill filters before Skill/Task/Control Point behavior can execute
  - data blocker: duplicate, edit, and delete cases need deterministic existing control point rows
  - source-alignment blocker: `Escalation Required` and `Evidence Type` appear required in the UI, but current component enforcement/model parity is incomplete
