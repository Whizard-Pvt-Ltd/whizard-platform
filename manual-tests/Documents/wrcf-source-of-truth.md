# WRCF Source Of Truth

## Canonical Sources

The canonical source of truth for WRCF product behavior, structure, terminology, and schema is:

1. `temp/WRCF Functional Specs.pdf`
2. `temp/WRCF definition & Schema.pdf`

These PDFs define the intended WRCF hierarchy, capability-instance model, and manage-skills behavior.

## Derived Test Artifact

`temp/WRCF End-to-End Test Cases_reverified.xlsx` is not the product source of truth.

It is a derived testing artifact generated from the WRCF PDF specifications. It is still useful for:

- stable test IDs
- coverage tracking
- execution planning
- mapping scenarios into Playwright specs and companion docs

But it must not override PDF-defined product intent.

## Source Priority For WRCF Test Work

Use WRCF sources in this order:

1. `temp/WRCF Functional Specs.pdf`
2. `temp/WRCF definition & Schema.pdf`
3. `temp/WRCF End-to-End Test Cases_reverified.xlsx`
4. Current UI behavior for execution validation only

## Working Rule

If the workbook and the PDFs differ:

- follow the PDFs as the source of truth
- use the workbook as the coverage ledger
- document the mismatch in the companion spec doc and memory files

## Exclusions

`temp/College Student Onbaording FS.pdf` is unrelated to WRCF and must not be used to define WRCF behavior.
