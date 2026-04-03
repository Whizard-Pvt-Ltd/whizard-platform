# wrcf_CI_Mapping.playwright.spec

**Source:** `manual-tests/wrcf_CI_Mapping.playwright.spec.ts`

## Purpose

PDF-backed coverage for WRCF Capability Instance mapping, traced to the `CI Mapping` tab in `WRCF End-to-End Test Cases_reverified.xlsx`, covering `CIMAP-E2E-001` through `CIMAP-E2E-035`.

## Covered Tests

- `CIMAP-E2E-001` through `CIMAP-E2E-035`
- executable coverage includes saved and unmapped proficiency indicators, pending-count behavior, mapping popup open/defaults, popup filter ordering, PWO grouping, CI row formatting, pending-tag display, accordion counts, pending-row delete behavior, and saved-row delete action visibility
- workbook rows that require live CI save/delete cleanup, dependency-seeded data, multi-context fixtures, or behavior that currently diverges from the live UI remain present as explicit pending `fixme` cases with blockers

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> confirm default sector + industry
  -> select Functional Group
  -> select Primary Work Obj.
  -> select Secondary Work Obj.
  -> select Capability
  -> inspect Proficiency Level mapping state
      -> stage pending CI selections
      -> open Mappings dialog
      -> review grouped saved/pending CI entries
```

## Navigation Notes

- Entry page: `Manage Industry WRCF` at `/industry-wrcf`
- Parent selections used before CI mapping assertions:
  - Industry Sector
  - Industry
  - Functional Group
  - Primary Work Object
  - Secondary Work Object
  - Capability
- CI mapping state is expressed in the `Proficiency Level` column through checkbox states:
  - unsaved/pending selection
  - saved/mapped selection
- The `Mappings` dialog is the review/save layer for Capability Instances and is also the handoff point to downstream `Manage WRCF Skills` via `Skill+`

## Notes

- Reuses the existing `/industry-wrcf` auth and hierarchy-selection pattern from the completed WRCF specs
- Scenario intent comes from `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf`
- Uses the live proficiency checkbox state classes: pending `.checked` and saved `.saved`
- Keeps save-heavy and dependency-heavy workbook rows visible as pending cases until the local environment can support deterministic cleanup and downstream-skill validation

## Pending Cases And Blockers

- `CIMAP-E2E-007`, `CIMAP-E2E-008`, `CIMAP-E2E-032`
  Blocker: need deterministic multi-path or multi-FG data with different saved CI states.
- `CIMAP-E2E-009`, `CIMAP-E2E-028`, `CIMAP-E2E-029`, `CIMAP-E2E-035`
  Blocker: need safe live-save coverage plus deterministic cleanup for created CI records.
- `CIMAP-E2E-010`, `CIMAP-E2E-027`
  Blocker: current UI retains parent pending cache after dialog close; workbook expects discard-on-close behavior.
- `CIMAP-E2E-016`, `CIMAP-E2E-026`, `CIMAP-E2E-031`, `CIMAP-E2E-033`
  Blocker: current live implementation differs from workbook expectations for accordion ordering, outside-click behavior, mapped-only filters, and filter-scoped pending visibility.
- `CIMAP-E2E-023`, `CIMAP-E2E-024`
  Blocker: need saved CI rows with and without downstream skill dependencies.
- `CIMAP-E2E-030`, `CIMAP-E2E-034`
  Blocker: need controlled duplicate or partial-failure save scenarios from backend validation.
