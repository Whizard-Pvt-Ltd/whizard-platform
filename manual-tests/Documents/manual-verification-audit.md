# WRCF Manual Verification Audit

Purpose: reconcile differences between:
- `temp/wrcf-manual-testing.pdf`
- `temp/wrcf-manual-testing-verification.docx`
- existing Playwright results/spec intent
- `temp/WRCF End-to-End Test Cases_reverified-v2.xlsx`

Important rule for this audit:
- treat the current `v2` workbook as provisional for the rows listed below
- do not trust older workbook result mapping for these rows without revalidation
- when manual verification says "wrong from playwright test", prefer manual re-check before keeping the current automated verdict

## Disputed Cases

| Module | Manual / Verification Concern | Current Workbook / Playwright Mapping | Current Latest Result | What We Should Do |
|---|---|---|---|---|
| Dashboard | Duplicate dropdown arrows in Industry Sector / Industry filters is a UI bug, not a sorting case | `DASH-E2E-004/005/006` were previously used in overlap discussions | `pass/pass/pass` | Do not map this manual bug to sorting tests. Add or keep separate UI-only row instead. |
| Dashboard | Carry-forward/default filter behavior from redirect is partly unclear in earlier notes | `DASH-E2E-026` | `fail` | Recheck this manually with explicit non-default sector/industry, then keep as carry-forward test only. |
| Manage WRCF | Alphabetical order comments in verification say earlier mapping was wrong | `MIWRCF-E2E-002`, `004` | `pass/pass` | Revalidate live UI once more, but these are still the correct candidate rows for ascending-order checks. |
| Manage WRCF | FG/PWO/SWO alphabetical vs default-first selection were mixed together in earlier comparison | `MIWRCF-E2E-009/010/011/012/014/015` | mixed | Split into two buckets: order checks vs default-selection checks. Do not use one to justify the other. |
| Manage WRCF | Capability/proficiency default-view interpretation was unclear | `MIWRCF-E2E-017`, `020` | `pass/fail` | Keep `017` only for capability list/order. Keep `020` only for ascending proficiency order. Manual wording should not merge them. |
| FG | Earlier comparison said `FG-E2E-006` passed, but manual verification says that was wrong | `FG-E2E-006` | `fail` | Keep as disputed until manually rechecked; likely current fail is more truthful. |
| FG | Duplicate handling may not actually be passing/fully correct | `FG-E2E-009`, `010` | `fail/fail` | Manual verification supports the idea that earlier optimistic mapping was wrong. Keep current fail unless manual retest proves otherwise. |
| PWO | Duplicate-name pass result was flagged as wrong in verification doc | `PWO-E2E-006`, `007`, `012` | `pass/pass/pass` | Re-run these in headed/manual-aligned mode. High-priority audit item. |
| SWO | Duplicate-name pass result was flagged as wrong in verification doc | `SWO-E2E-006`, `007`, `012` | `pass/pass/pass` | Re-run these in headed/manual-aligned mode. High-priority audit item. |
| CI Mapping | Popup inheritance/grouping was marked as working in manual verification | `CIMAP-E2E-012`, `014`, `015`, `017` | `pass/pass/pass/pass` | These are currently the strongest trustworthy overlaps. Keep as validated unless live behavior changes. |
| CI Mapping | Alphabetical/filter behavior still disputed | `CIMAP-E2E-013`, `016` | `fail/fail` | Recheck live order implementation explicitly. These are proper ascending-order targets. |
| Manage WRCF Skills | Default selected-filter behavior from Manage WRCF/navigation is failing and manually disputed | `WSKILL-E2E-001`, `002` | `fail/fail` | Keep strict. These are default-behavior tests and should fail if prefill is absent. |
| Manage WRCF Skills | Ascending-order expectation needs explicit manual recheck | `WSKILL-E2E-004` | `fail` | Check actual dropdown sort implementation before preserving workbook fail. |
| Manage WRCF Skills | Skills resolution for selected CI path was manually noted as working | `WSKILL-E2E-006` | `pass` | Treat as a good validated overlap row. |

## Ascending Order Checks To Revalidate Explicitly

These are the places where ascending-order logic exists in specs today and should be checked against live UI before we trust workbook values:

- `DASH-E2E-004` Industry Sector alphabetical order
- `DASH-E2E-006` Industries under selected sector alphabetical order
- `MIWRCF-E2E-002` Industry Sector alphabetical order
- `MIWRCF-E2E-004` Industries for selected sector alphabetical order
- `MIWRCF-E2E-009` FG alphabetical order
- `MIWRCF-E2E-020` proficiency ascending order
- `CIMAP-E2E-013` popup filter alphabetical order
- `CIMAP-E2E-016` PWO accordion alphabetical order
- `WSKILL-E2E-004` active dropdown alphabetical order

## Recommended Correction Batch

Do these before editing more workbook verdicts:

1. Recheck the disputed duplicate-validation cases in headed mode:
   - `PWO-E2E-006`, `007`, `012`
   - `SWO-E2E-006`, `007`, `012`
2. Recheck the disputed ascending-order cases listed above.
3. Keep UI-only manual bugs separate from sorting/functional rows.
4. Only after that, correct the corresponding rows in `WRCF End-to-End Test Cases_reverified-v2.xlsx`.

## Suggested Workbook Handling

For the disputed rows above:
- do not treat the current latest result as final truth
- add/update notes only after revalidation
- avoid mapping UI-only visual issues to existing functional order cases

## Focused Recheck Results (2026-04-05)

### Confirmed as Trustworthy Current Results

- `PWO-E2E-006`, `PWO-E2E-007`, `PWO-E2E-012`
  - rerun result: `3 passed`
  - conclusion: current workbook/Playwright pass is believable; the verification doc's earlier concern does not override the fresh run.

- `SWO-E2E-006`, `SWO-E2E-007`, `SWO-E2E-012`
  - rerun result: `3 passed`
  - conclusion: current workbook/Playwright pass is believable; the verification doc's earlier concern does not override the fresh run.

- `DASH-E2E-004`, `DASH-E2E-006`
  - rerun result: `passed`
  - conclusion: current alphabetical-order checks are valid. The manual duplicate-arrow bug should stay separate as a UI issue.

- `MIWRCF-E2E-002`, `MIWRCF-E2E-004`, `MIWRCF-E2E-009`
  - rerun result: `passed`
  - conclusion: these are valid ascending-order checks and can stay mapped as such.

- `CIMAP-E2E-012`, `014`, `015`, `017`
  - not rerun in this batch, but prior audit still treats them as the strongest trustworthy overlap rows.

- `WSKILL-E2E-006`
  - rerun result: `passed`
  - conclusion: skills resolution for selected CI path remains a good validated overlap row.

### Confirmed as Real Fails / Not Mapping Mistakes

- `DASH-E2E-026`
  - rerun result: `failed`
  - actual failure: Edit Structure redirect opens `Manage Industry WRCF` without carrying sector/industry selected values.
  - conclusion: keep as a real fail.

- `WSKILL-E2E-001`, `WSKILL-E2E-002`
  - rerun result: `failed` with explicit future blocker messages
  - conclusion: keep strict; these are genuine default-behavior gaps, not mapping mistakes.

- `WSKILL-E2E-004`
  - rerun result: `failed`
  - actual failure shows unsorted dropdown values in live runtime.
  - conclusion: keep as a real ascending-order fail.

- `CIMAP-E2E-013`
  - rerun result: `failed`
  - actual failure shows popup sector options are not alphabetically ordered (`Power Generation` appears before `Energy & Utilities`).
  - conclusion: keep as a real ascending-order fail.

- `CIMAP-E2E-016`
  - current spec status: explicit `@future` blocker
  - conclusion: keep as future until the app exposes stable alphabetical PWO accordion ordering.

### Needs Assertion Refinement, Not Product Reclassification

- `MIWRCF-E2E-020`
  - rerun result: `failed`
  - actual failure is not ordering; it is exact-text mismatch:
    - expected `L3 Conditional Independence Supervised`
    - received `L3 Conditional Independence - Supervised`
    - expected `L4 Conditional Independence Scoped`
    - received `L4 Conditional Independence - Scoped`
  - conclusion: this should be treated as an assertion-format issue, not evidence that ascending order is broken.

## Test Environment Recheck Results (test.whizard.club)

Environment used:
- `BASE_URL=https://test.whizard.club`

### Confirmed on Test Environment

- `DASH-E2E-004`, `DASH-E2E-006`
  - earlier result: `passed`
  - updated conclusion: do **not** trust those earlier passes
  - why: the old dashboard sort tests were still using mocked data or a brittle dropdown path, and manual screenshot evidence on `test` shows Industry Sector order is not alphabetical
  - current status after patching out mocks: still blocked by dashboard dropdown selector/runtime interaction, so there is no trustworthy automated pass yet

- `DASH-E2E-026`
  - result: `failed`
  - meaning: carry-forward into Manage Industry WRCF is genuinely failing on the test site as well.

- `MIWRCF-E2E-002`
  - result: `failed`
  - meaning: Industry Sector order is not ascending on the test site (`Power Generation` appears before `Energy & Utilities`).

- `MIWRCF-E2E-004`
  - result: `passed`
  - meaning: industry order under selected sector passed in this focused test-site rerun.

- `MIWRCF-E2E-009`
  - result: `failed`, but due to setup/data path (`No selectable options were available.`)
  - meaning: not enough evidence to classify FG ordering on test as pass/fail yet.

- `MIWRCF-E2E-020`
  - latest patched result: `passed`
  - meaning: after normalizing proficiency labels, the proficiency order itself is fine on the test site

- `SWO-E2E-006`, `SWO-E2E-007`, `SWO-E2E-012`
  - result: `3 passed`
  - meaning: SWO duplicate/edit validation passes are supported on the test site.

- `CIMAP-E2E-013`
  - result: `failed`
  - meaning: popup filter ordering is genuinely failing on the test site too.

- `CIMAP-E2E-016`
  - result: explicit future blocker
  - meaning: keep as future until alphabetical PWO accordion behavior exists or is validated.

### Blocked or Provisional on Test Environment

- `PWO-E2E-006`, `PWO-E2E-007`, `PWO-E2E-012`
  - still not revalidated cleanly on `test`
  - keep earlier localhost conclusion, but do not treat them as test-site confirmed yet

- `PWO-E2E-010`
  - patched env precheck now allows execution on `test`
  - current spec still throws its explicit future blocker message about non-guaranteed alphabetical ordering
  - keep as provisional until converted from a hard-coded future blocker into a live executed ordering assertion

- `WSKILL-E2E-001`, `WSKILL-E2E-002`
  - not part of the latest sorting-only patch batch
  - keep strict default-behavior conclusions as-is

- `WSKILL-E2E-004`
  - latest patched result: `failed`
  - meaning: active dropdown values are genuinely not in ascending order on `test`

- `WSKILL-E2E-006`
  - latest patched result: `passed`
  - meaning: selected CI path resolution is working on `test`

- `SWO-E2E-010`
  - latest patched result: `failed`
  - meaning: current SWO list is genuinely not alphabetical on `test`

## Current Practical Rule

For the disputed overlap set:
- if the case ran successfully on `test.whizard.club`, prefer the test-site result for manual-bug reconciliation
- if the case was blocked by test-site auth/setup, keep the result provisional and do not replace the earlier localhost conclusion yet
