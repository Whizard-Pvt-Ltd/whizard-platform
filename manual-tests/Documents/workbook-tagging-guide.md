# Workbook Tagging Guide

This file explains how the execution metadata in `temp/WRCF End-to-End Test Cases_reverified.xlsx` should be maintained.

## Purpose

The workbook is a planning and traceability artifact.

It now carries execution metadata so we can quickly see:
- what should run by default
- what is authored but deferred
- what is failing for a real reason
- what is still not generated

## Execution Columns

Each WRCF sheet now includes these columns:

- `Run Tag`
  - `@stable`: should be included in the default run
  - `@future`: authored/planned coverage that is excluded from the default run
- `Priority Tag`
  - `@p0`, `@p1`, `@p2`
- `Module Tag`
  - examples: `@task`, `@manage-wrcf`, `@skills`
- `Execution Status`
  - `pass-verified`
  - `stable-completed`
  - `stable-partial`
  - `stable-candidate`
  - `fail-open`
  - `future-authored`
  - `pending-generation`
- `Blocker Type`
  - `none`
  - `runtime/data`
  - `seed-data`
  - `product-gap`
  - `business-rule`
  - `role`
  - `not-generated`
- `Execution Notes`
  - short explanation of current state

## How To Classify Rows

Use `@stable` when:
- the scenario should run in the normal suite now
- a failure should be treated as real signal

Use `@future` when:
- the scenario should stay visible in the same spec/workbook
- but we do not want it in the default run yet

Use `fail-open` when:
- the test should run now
- and it is currently failing on a real product/runtime issue

Use `future-authored` when:
- the scenario already has authored test intent
- but is intentionally deferred from the default run

Use `pending-generation` when:
- the workbook row exists
- but no Playwright spec/doc exists yet

## Important Rule

Do not use workbook tags to redefine product behavior.

Source priority remains:
1. `temp/WRCF Functional Specs.pdf`
2. `temp/WRCF definition & Schema.pdf`
3. `temp/WRCF End-to-End Test Cases_reverified.xlsx`
4. current UI behavior for execution validation only

## Updating The Workbook

When a spec changes meaningfully:
- update the matching workbook rows
- keep `Run Tag` aligned with the repo tagging strategy
- update `Execution Status`
- update `Blocker Type`
- refresh `Execution Notes`

Typical examples:
- stable test starts passing: `fail-open` -> `pass-verified`
- future test gets implemented: `@future` -> `@stable`
- spec gets generated for a previously missing sheet: `pending-generation` -> `future-authored` or `stable-candidate`

## Running By Tag

The workbook tags mirror Playwright tags, but Playwright can only filter by tags that already exist in the spec file.

Examples:
- `wrcf_Task.playwright.spec.ts` is tag-migrated, so `@p0`, `@p1`, `@future`, `@task` filters work there.
- `wrcf_Functional_Group.playwright.spec.ts` is not tag-migrated yet, so workbook tags are planning metadata only for now.
