# PlaywrightDocuments

This folder contains the companion markdown files for Playwright specs in `manual-tests/`.

## Purpose

Each file here explains a single Playwright suite:

- what it covers
- which workbook/PDF/doc rows it maps to
- what flow/navigation it follows
- what blockers or known mismatches exist
- which cases are stable versus future

## Naming

Each companion file should match its spec name:

- spec: `manual-tests/wrcf_Task.playwright.spec.ts`
- companion doc: `manual-tests/Documents/PlaywrightDocuments/wrcf_Task.playwright.spec.md`

## When To Update

Update the companion doc when:

- a new spec is created
- the flow/navigation changes
- a blocker changes
- source interpretation changes
- stable/future classification changes

## What Not To Put Here

Do not put shared process docs or general runbooks here.

Those should stay in:

- `manual-tests/Documents/`
