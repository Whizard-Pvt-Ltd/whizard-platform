# Documents

This folder stores supporting documentation for the `manual-tests/` area.

## Purpose

Use this directory for human-readable guidance, runbooks, source-of-truth notes, workbook guidance, and companion documentation for Playwright specs.

## What Lives Here

- `PlaywrightDocuments/`
  - companion markdown for each `*.playwright.spec.ts` file
  - explains scope, flow, blockers, and source alignment for a specific suite
- `playwright-run-commands.md`
  - copy-paste commands for running suites and tags
- `workbook-tagging-guide.md`
  - explains workbook tracking/tagging conventions
- `wrcf-source-of-truth.md`
  - short note on source priority for WRCF work
- `TESTING_PROTOCOL.md`
  - high-level testing workflow/process notes
- login-page and other focused markdown files
  - manual findings, MCP notes, or one-off reports

## Usage Rule

- if you are working on a Playwright spec, first check `PlaywrightDocuments/`
- if you are working on commands/process, check the top-level docs in this folder
- if a document is suite-specific, keep it in `PlaywrightDocuments/`
- if a document applies across suites, keep it in `Documents/`
