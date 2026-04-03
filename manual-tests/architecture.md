# Manual Tests Architecture

## Purpose

This document explains how the `manual-tests/` area is organized, how WRCF test artifacts are derived, and how execution/blocker handling is expected to work.

## Source Hierarchy

For WRCF work, the source hierarchy is:

1. `temp/WRCF Functional Specs.pdf`
2. `temp/WRCF definition & Schema.pdf`
3. `temp/WRCF End-to-End Test Cases_reverified.xlsx`
4. Current UI/runtime behavior for execution validation only

The PDFs define product behavior and schema intent.

The workbook is a derived testing ledger used for:

- test IDs
- coverage mapping
- execution planning
- Playwright spec traceability

If the workbook and PDFs differ, the PDFs win and the mismatch should be documented in the companion spec doc and memory files.

## Folder Structure

`manual-tests/` is split into four main layers:

1. Memory and control files
- `CODEX_EXECUTION_GUIDE.md`
- `CODEX_PROGRESS_LOG.md`
- `known_issues.md`
- `rules.json`

These preserve workflow state, reusable lessons, and validation rules between sessions.

2. Executable Playwright specs
- `*.playwright.spec.ts`

These are the runnable test suites. For WRCF, each sheet/entity normally gets its own spec.

3. Companion documentation
- `Documents/*.playwright.spec.md`
- `Documents/wrcf-source-of-truth.md`

These explain intent, coverage, blockers, and traceability for each suite.

4. Generated outputs
- `results/`
- `test-results/` at repo root
- `playwright-report/` at repo root

These contain ordered exports, Playwright reports, and failure artifacts.

## Test Architecture

WRCF tests are layered:

1. Base layer
- auth
- service readiness
- shared navigation/setup

2. Module layer
- entity-specific CRUD
- filters
- validations
- dependency behavior

3. Journey layer
- multi-step business flows across entities

The goal is to avoid retesting lower layers inside every higher-layer scenario. Auth and service-readiness checks are reused as preconditions instead of being asserted repeatedly in every test body.

## WRCF Suite Pattern

Most WRCF specs follow this structure:

1. `beforeAll`
- verify local services
- establish or reuse authenticated storage state

2. `beforeEach`
- create a fresh browser context/page

3. Guarded context setup
- resolve the minimum required parent context
- return a boolean or safe fallback instead of throwing when the environment is blocked

4. Test classification
- executable cases
- future product-gap cases tagged `@future`
- runtime/data blocker cases tracked separately in docs and progress logs
- stable cases tagged `@stable`

This allows a suite to remain runnable even when parent data or runtime conditions are not ready.

## Default vs Fallback Rule

WRCF specs should distinguish between two kinds of checks:

- strict default-behavior checks
- independent behavior checks that only need a valid selected context

Rule:

- if the requirement under test is auto-selection, carry-forward, prefill, or retained default state, the test must stay strict and fail when that default behavior is missing
- if the requirement under test is downstream behavior such as sorting, filtering, list loading, counts, or child-column refresh, the test should establish the needed sector/industry/path selections itself instead of failing only because defaults were not pre-applied

This keeps failures attached to the real feature under test instead of creating misleading cascade failures.

## Tag-Based Execution Model

The repo now uses one-file stable/future coverage instead of duplicate specs.

- `@stable` tests run in the default Playwright flow
- `@future` tests stay authored in the same spec file and are included in normal runs unless the user explicitly asks to exclude them
- `@p0`, `@p1`, and `@p2` enable smaller priority runs
- module tags such as `@dashboard` and `@task` support targeted execution

Default behavior:

- `playwright.config.ts` includes `@future` in normal runs
- explicit future-only runs use `--grep @future`

## Blocker Model

A WRCF suite should not fail noisily when the environment or seeded data is missing.

Instead:

- use `@future` for known product gaps or deferred feature coverage
- use guarded setup helpers plus explicit runtime/data failure messages for environment blockers
- document blockers in the companion markdown
- record reusable patterns in `known_issues.md`
- update `CODEX_PROGRESS_LOG.md` after generation and execution

This keeps the suite truthful without making the whole test run unstable.

## Validation Rules

A generated suite is not considered complete just because the file exists.

Minimum acceptance for each new or regenerated WRCF spec:

- spec generated
- companion doc created or updated
- execution attempted
- blocker documented if execution cannot complete
- progress/memory files updated when a new reusable lesson appears

## Current Throughput Strategy

The workflow is optimized for many similar sheets:

- reuse the closest existing spec as the template
- keep source interpretation PDF-first
- use workbook rows as the case map
- run a small focused smoke set first
- then run the full suite once
- convert repeated failures into memory rules instead of rediscovering them

This is how `manual-tests/` is intended to scale across the remaining WRCF sheets.
