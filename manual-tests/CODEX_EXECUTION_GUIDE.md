# CODEX Execution Guide

## Objective

Continue the workbook-driven Playwright test generation work in this repo as quickly and consistently as possible.

This is a continuation workflow, not a fresh discovery exercise for every sheet.

Main goals:
1. Reuse existing successful test patterns.
2. Generate the next pending workbook-driven spec and companion doc.
3. Run the generated test after creation.
4. Fix obvious issues immediately.
5. Record failures, fixes, and reusable learnings.
6. Avoid repeating the same mistakes across similar entities/sheets.
7. Reduce token/context usage by relying on repo files as memory.
8. Apply validation, prioritization, and layered execution so effort is spent where it matters most.

---

## Project Context

You are continuing Playwright test generation work in this repo.

Source material is inside the `temp/` folder. Use these as primary references:
- `temp/WRCF End-to-End Test Cases_reverified.xlsx`
- `temp/WRCF definition & Schema.pdf`
- `temp/WRCF Functional Specs.pdf`
- `temp/College Student Onbaording FS.pdf`


Also use existing repo artifacts under `manual-tests/` as implementation guardrails/templates.

What has already been done:
- existing `manual-tests/` specs/docs already exist for several flows
- PWO and SWO were created from the Excel workbook
- companion markdown/docs and README updates also exist
- the existing generated test files should be treated as pattern references for naming, structure, coverage style, and documentation approach

Working rule:
Do not start from scratch for every entity.
Reuse the same structure, style, and coverage pattern from the existing generated specs so the remaining entities can be completed faster.

Primary goal:
Continue converting the remaining Excel/workbook-driven test cases into Playwright TypeScript specs and matching docs, using the already-created files as guardrails.

Use the PDFs only to clarify business meaning, terminology, and expected behavior when the sheet is ambiguous.
Use Playwright MCP validation only when necessary to resolve uncertainty.
Prefer fast, structured continuation over broad re-analysis.

---
## Workflow Architecture

This repo follows a structured test-generation workflow:

### 1. Inputs
Source inputs include:
- test sheets / workbooks
- product docs / PRDs
- existing tests
- repo guardrails under `manual-tests/`

### 2. Structure
Before or during generation:
- convert source understanding into a consistent scenario structure
- normalize steps, expected results, and scenario groupings
- keep traceability back to workbook/docs

### 3. AI Generation (Codex)
Codex should use:
- reusable prompts
- golden examples from existing tests
- known rules/issues from repo memory files

### 4. Validation Gate
Every generated test must pass a validation gate before being accepted.

Validation checks include:
- no hardcoded waits
- stable selectors only
- strong assertions
- enforce reuse of existing patterns
- no duplicate scenarios
- correct priority tagging where applicable
- companion documentation updated

If validation fails:
- reject the draft
- fix it
- re-run validation

### 5. Test Architecture
Generated tests should align with the repo’s preferred structure, including:
- page objects where useful
- utilities / fixtures
- data factories or reusable test data helpers where needed

### 6. Execution
Run tests through Playwright with smart execution strategy:
- parallel where appropriate
- tagged suites such as `@smoke`, `@regression`, or priority-based grouping
- do not run everything every time

### 7. Debug and Feedback
When tests fail:
- capture logs
- capture screenshots
- capture trace if available
- feed failure details back into Codex
- ask Codex for root cause, likely fix, and prevention rule

### 8. Memory System
Persist learnings in repo files:
- `manual-tests/CODEX_PROGRESS_LOG.md`
- `manual-tests/known_issues.md`
- `manual-tests/rules.json`

Use these to store:
- known issues
- fix patterns
- anti-patterns
- reusable constraints

### 9. CI/CD and Coverage
Over time, this workflow should support:
- pipeline execution
- flakiness control
- reporting
- coverage gap detection

------
## Primary Source Locations

Use the `temp/` folder as the main source area.

Expected source files:
- `temp/WRCF End-to-End Test Cases_reverified.xlsx`
- `temp/WRCF definition & Schema.pdf`
- `temp/WRCF Functional Specs.pdf`
- `temp/College Student Onbaording FS.pdf`


Use `manual-tests/` as the implementation and guardrail area.

---

## Supporting Memory / Constraint Files

Treat these as active constraints, not passive notes:

- `manual-tests/CODEX_PROGRESS_LOG.md`
- `manual-tests/known_issues.md`
- `manual-tests/rules.json` (if present)

At the start of every session:
- read the execution guide
- read the progress log
- read known issues / rules
- explicitly avoid previously recorded mistakes
- explicitly reuse previously successful patterns

If `known_issues.md` or `rules.json` does not exist yet, create and maintain them.

---

## Source Priority

Use sources in this order:

1. **Existing `manual-tests/` specs/docs**
   - First reference for structure, naming, style, scenario format, and pending-case handling.
   - Reuse before inventing.

2. **Workbook in `temp/`**
   - Main source for pending sheet/entity coverage.
   - Treat workbook-driven coverage as the primary task.

3. **PDFs in `temp/`**
   - Use only when workbook rows are ambiguous or business meaning needs clarification.

4. **Playwright MCP / Playwright UI validation**
   - Use Playwright MCP as the preferred targeted inspection/validation layer when workbook rows or docs are ambiguous.
   - Use it to inspect selectors, confirm actual UI flow, verify page structure, validate field presence/order, and resolve mismatches between docs and UI.
   - Do not use MCP for broad re-exploration when an existing stable pattern already exists.

5. **Human intervention**
   - Ask when access, seeded data, expected behavior, or product intent remains unclear after reasonable checking.

---

## Core Working Rule

Do not start from scratch for every entity.

Because the UI and test structures are highly similar, use existing generated specs/docs as templates and guardrails so the remaining sheets can be completed much faster.

Prefer fast continuation over repeated broad re-analysis.

---

## Layered Testing Rule

Do not re-test lower-level validated functionality inside every higher-level module.

Examples:
- if login is already separately covered and stable, do not re-test full login behavior in every module flow
- if navigation or setup flow is already validated elsewhere, reuse it as a precondition unless the current test specifically targets it

Test in layers:
1. **Base layer**
   - login
   - common navigation
   - common setup/preconditions

2. **Module layer**
   - entity-specific CRUD, mapping, filters, validations, actions

3. **Journey layer**
   - critical end-to-end user/business flows

Only test the layer relevant to the current case unless regression scope specifically requires more.

---

## Validation Layer Before Accepting Tests

Before accepting any newly generated test/spec, validate it against a rule layer.

This validation layer should be continuously amendable.

Validation checks should include:
- naming matches repo conventions
- scenario is traceable to workbook/spec source
- no duplicate case already exists
- case belongs to the correct priority bucket
- assertions are meaningful and not redundant
- lower-level already-covered behavior is not unnecessarily retested
- pending cases are clearly marked
- required logs/screenshots/debug artifacts are captured on failure
- companion markdown is updated
- progress log is updated

These rules may be stored and maintained in:
- `manual-tests/rules.json`
- `manual-tests/known_issues.md`

---

## Test Priority / Categorization

Categorize cases so execution is smarter and faster.

### P0 — Critical User Journeys
Core business-critical flows that must work.
Examples:
- create/edit key entity
- save/publish critical configuration
- core mapping flow
- primary approval/onboarding flow

### P1 — Edge Cases
Boundary conditions, unusual states, negative validations, alternate flows.

### P2 — Data Variations
Same flow with multiple data combinations, permutations, or minor field variations.

Every case does not need to run every time.

Recommended execution strategy:
- default smoke/regression: run P0 first
- run P1 when module changes affect validations/branching behavior
- run P2 selectively or in deeper regression cycles

---

## Duplicate Avoidance Rule

Do not generate duplicate cases.

Before adding a case:
- check existing specs/docs
- check workbook traceability
- check whether the behavior is already covered at another layer
- check whether this is just a data variation rather than a new scenario

If a new case is only a repetition of an existing validated pattern, do not duplicate it unless there is a clear reason.

---

## Standard Workflow

For each next pending workbook-driven entity/sheet:

1. Check what is already completed in `manual-tests/`.
2. Check active constraints:
   - progress log
   - known issues
   - rules
3. Identify the next pending workbook-driven sheet/entity.
4. Pick the closest existing spec/doc as the template.
5. Categorize proposed scenarios into P0 / P1 / P2.
6. Pass them through the validation layer before finalizing.
7. If workbook/docs are unclear, do targeted Playwright MCP inspection before coding.
8. Generate or update:
   - `.spec.ts`
   - matching companion `.md`
9. Run the right priority level for the current context.
10. Fix straightforward issues.
11. If blocked, document blocker clearly.
12. Update:
   - `CODEX_PROGRESS_LOG.md`
   - `known_issues.md`
   - `rules.json` if new reusable rule emerged

Do not leave newly created tests unvalidated unless blocked by environment, data, or access.

---

## Playwright MCP Usage Rule

Use Playwright MCP as the default targeted UI-inspection tool when documentation alone is not enough.

Use MCP for:
- validating selectors
- confirming field presence and order
- checking navigation flow
- verifying modal/popup behavior
- understanding validation timing and messages
- confirming actual UI behavior when workbook/spec wording is ambiguous
- resolving mismatches between documents and the live UI

Do not use MCP to re-discover the whole product repeatedly.
Use it as a focused validation step to support fast workbook-driven test generation.

Typical order:
1. workbook
2. existing spec/template
3. PDF clarification if needed
4. Playwright MCP targeted inspection
5. generate/update spec
6. run and validate

---

## Guardrails

### Reuse First
- Reuse naming patterns, describe blocks, helper style, comments, and pending-case handling from existing specs.
- If two sheets/entities are structurally similar, adapt the nearest existing successful file.

### Workbook First
- Remaining work is mainly workbook-driven.
- Do not over-expand into full product rediscovery for each sheet.

### Clarify Only When Needed
Use PDFs only when:
- workbook wording is ambiguous,
- business terminology is unclear,
- expected behavior is not obvious from existing patterns.

Use Playwright MCP / UI validation only when:
- selectors need confirmation,
- actual flow differs from expectation,
- workbook/docs conflict with UI,
- a flow needs visual inspection before creating stable Playwright coverage.

Playwright MCP should be the preferred tool for targeted UI inspection before asking for human intervention.

### No Guessing
Do not invent unsupported behavior.
If uncertain:
- leave a pending note,
- document the assumption,
- request human intervention if needed.

---

## File Rules

For each completed entity/sheet, create or update:

### 1. Playwright spec
- Keep location and naming aligned to existing repo patterns.

### 2. Companion markdown
Include:
- source used
- scenario coverage
- priority bucket (P0/P1/P2)
- assumptions
- pending/data-dependent cases
- special run instructions if any
- known blockers/gaps

### 3. Progress / memory files
Always update as needed:
- `manual-tests/CODEX_PROGRESS_LOG.md`
- `manual-tests/known_issues.md`
- `manual-tests/rules.json` (if rule-level updates are needed)

---

## Run-and-Validate Rule

After generating each spec:
1. Run the relevant priority set.
2. Capture pass/fail status.
3. Fix obvious issues.
4. Record:
   - command used
   - output summary
   - failure cause
   - fix applied
   - unresolved blocker if any

Do not run everything every time.
Run according to priority and impact.

---

## Failure Handling

When a test fails:

1. Capture failure artifacts:
   - logs
   - screenshots
   - trace if available

2. Feed failure details back into Codex.

3. Ask Codex to propose:
   - root cause
   - likely fix
   - prevention rule

Classify failures as one of:
- selector issue
- timing/wait issue
- auth/session issue
- seeded data missing
- environment/setup issue
- wrong workbook interpretation
- wrong assumption from docs
- product bug / unsupported flow
- naming mismatch / locator mismatch
- flaky behavior

For each failure, record:
- where it happened
- root cause
- exact fix
- prevention note

Also update `known_issues.md` when the failure reveals a reusable pattern.

---

## Human Intervention Rule

Ask for human intervention when:
- login/access is missing
- seeded data is missing
- workbook expectation conflicts with actual UI
- Figma/doc/UI mismatch is significant
- repeated failures suggest business clarification is needed
- destructive action behavior is unclear
- environment is broken and cannot be fixed in-context

Do not waste cycles repeatedly guessing.

---

## Token Usage Rules

To reduce token usage and improve throughput:

- Do not restate full project background in every session.
- Treat this guide, `CODEX_PROGRESS_LOG.md`, `known_issues.md`, and `rules.json` as working memory.
- Work on the next pending sheet/entity or a small batch of similar sheets.
- Use existing `manual-tests/` files as the first reference.
- Use the workbook as the main source.
- Open PDFs only when workbook rows are ambiguous.
- Use Playwright MCP only when verification is necessary.
- Store learnings and failure patterns in repo files instead of repeating them in chat.
- Keep chat responses short and execution-oriented.
- Prefer updating repo files over writing long narrative explanations in chat.
- Reuse established patterns instead of regenerating logic from scratch.

---

## Throughput Expectation

The process should move much faster because:
- many UI patterns are similar,
- existing specs already act as templates,
- workbook structures repeat,
- prior mistakes should be captured and reused as active constraints,
- not every case needs to run every time.

Target mindset:
Do not spend 1–2 hours rediscovering one sheet if an existing pattern already solves most of it.

---

## Session Start Format

At the start of each session:

1. State completed entities/sheets.
2. State pending entities/sheets.
3. Read active constraints:
   - progress log
   - known issues
   - rules
4. Identify the next target.
5. State which existing spec/doc is being used as template.
6. Categorize cases into P0/P1/P2.
7. Use Playwright MCP for targeted inspection if needed.
8. Generate/update the spec and companion doc.
9. Run the relevant priority level.
10. Capture failure artifacts if needed.
11. Update memory/constraint files.

Keep responses brief, practical, and incremental.