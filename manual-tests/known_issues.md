# Known Issues

## Purpose
This file stores repeated mistakes, blockers, and prevention rules.
Codex must read this at the start of every session and avoid repeating these issues.

## Current Known Issues

### 1. Rebuilding too much context
- Problem: Too much time/token usage is wasted re-explaining project history.
- Rule: Read repo memory files first and continue from them.

### 2. Overuse of PDFs
- Problem: Re-reading all PDFs for every entity wastes time.
- Rule: Reuse previously captured PDF-backed conclusions from memory/docs. Re-open the WRCF PDFs when behavior intent still needs confirmation, but do not treat the workbook as the product source.

### 3. Re-testing lower-level flows
- Problem: Already-covered base flows like login may get retested in every module.
- Rule: Use layered testing. Reuse stable lower-layer coverage as precondition.

### 4. Duplicate scenario generation
- Problem: Same scenario may be recreated with slightly different wording.
- Rule: Check existing specs/docs before adding a new case.

### 5. Not running immediately after generation
- Problem: Unvalidated specs accumulate and become harder to debug later.
- Rule: Run the relevant priority set immediately after creating/updating a spec.

### 6. Guessing uncertain behavior
- Problem: Unclear workbook/doc/UI behavior may be hardcoded incorrectly.
- Rule: Mark pending, validate in UI if needed, or ask for human intervention.

### 6a. Treating the workbook as the product source causes scenario drift
- Problem: If the workbook is treated as the source of truth, generated specs can quietly drift away from the actual WRCF behavior defined in the PDFs.
- Seen in: Manage WRCF Skills planning on 2026-03-31
- Rule: Read `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf` first for behavior and schema intent, then use `WRCF End-to-End Test Cases_reverified.xlsx` only as the coverage ledger and case-ID map.

### 7. Workbook reader dependency assumptions
- Problem: The shell may not have `openpyxl` or another Excel helper installed.
- Rule: Read workbook sheet names and rows directly from the `.xlsx` zip XML when Python Excel libraries are unavailable.

### 8. Partial local-service startup can look like a selector or auth bug
- Problem: The frontend may load on `localhost:4200` while BFF/Core API ports are still down, causing Playwright login to hang in `beforeAll`.
- Rule: If a new authenticated spec stalls at login, check `4200`, `3000`, and `3001` reachability before debugging selectors.

### 9. Generated earlier without proper execution validation
- Problem: Some earlier workbook-driven specs were generated but not properly validated by execution.
- Seen in: PWO, SWO
- Rule: Do not mark a sheet/entity as complete unless generation, execution attempt, and blocker/fix documentation are all done.

### 10. Login timeout can hide the real blocker
- Problem: Earlier authenticated suites could sit in `beforeAll` and look like selector or auth failures when the real issue was backend unavailability.
- Seen in: CI Mapping review, PWO/SWO revalidation pass
- Rule: Add an explicit service-readiness check to authenticated WRCF specs so blockers are fast and diagnosable.

### 11. Reachable services do not guarantee usable auth
- Problem: Even when `4200`, `3000`, and `3001` respond, login can still stall on `Signing in...` and keep the browser on `/login`.
- Seen in: PWO rerun, SWO rerun on 2026-03-31
- Rule: After service preflight passes, treat a stuck post-submit login as a separate auth/runtime blocker and record the page state or error context before changing spec selectors.

### 12. Do not assume Manage WRCF defaults are preselected
- Problem: Some branches load `/industry-wrcf` with blank sector and industry filters even after successful login.
- Seen in: SWO revalidation on 2026-03-31
- Rule: PWO/SWO/related specs must actively select the first valid sector and industry instead of assuming default filter values are already set.

### 13. Exact row matching can be too brittle for WRCF list items
- Problem: Create/edit assertions can fail even when the new row is visibly present because the locator matches the whole list item text too strictly.
- Seen in: PWO revalidation on 2026-03-31
- Rule: Match WRCF rows against the visible `.item-name` text instead of anchoring against the entire list item container text.

### 14. Workbook default-value expectations may drift from current branch behavior
- Problem: The workbook or older branch assumptions may hardcode a specific default enum value, while the current UI still presents a valid but different preselected option.
- Seen in: PWO-E2E-004 on 2026-03-31
- Rule: When the case intent is “valid default is preselected,” assert that the selected value is non-empty and belongs to the available option set unless the exact default is a confirmed requirement.

### 15. Count assertions must wait for the hierarchy list to finish loading
- Problem: A create-or-validation test can capture a stale `0` count if the column is visible but the entity rows have not loaded yet.
- Seen in: PWO-E2E-004 on 2026-03-31
- Rule: Before using list counts as a baseline, wait for at least the first relevant row to become visible when the dataset is expected to be non-empty.

### 16. Seeded duplicate names can break strict edit locators
- Problem: Edit flows can fail with strict-mode violations when seeded data contains multiple identical names such as `test PWO`.
- Seen in: PWO-E2E-011 and PWO-E2E-013 on 2026-03-31
- Rule: When clicking a named existing row in reused environments, target the first matching row or create a unique record for edit-specific assertions instead of assuming name uniqueness.

### 17. First-run WRCF page hydration can be flaky
- Problem: A first run can fail early on add-icon, popup, or default-field checks even though an immediate rerun passes, because `/industry-wrcf` is visible before hierarchy data is fully hydrated.
- Seen in: PWO revalidation on 2026-03-31
- Rule: After opening `/industry-wrcf`, wait for filter data and at least the first hierarchy rows/actions to become visible before asserting downstream behavior.

### 18. Treat repeated ordering failures as documented product/data gaps
- Problem: A workbook ordering assertion can keep failing on every rerun when the branch data itself is visibly unsorted.
- Seen in: PWO-E2E-010 on 2026-03-31
- Rule: Once the list is confirmed unsorted in the live UI, move the case to an explicit pending blocker instead of re-failing the suite on every rerun.

### 19. SWO setup cannot require PWO rows before FG selection
- Problem: On Manage Industry WRCF, PWO rows are populated only after a Functional Group is selected, so a readiness helper that waits for PWO rows too early causes repeated false failures.
- Seen in: SWO revalidation on 2026-03-31
- Rule: For SWO setup, wait for FG rows first, then select FG, then wait for PWO rows before selecting a PWO.

### 20. SWO duplicate/edit checks need a PWO that actually has SWO rows
- Problem: The first available PWO may be valid but still have no child SWOs, which makes duplicate and edit tests hang on an empty SWO column.
- Seen in: SWO-E2E-006, `007`, `011`, and `013` on 2026-03-31
- Rule: For SWO duplicate/edit/preload flows, select a PWO with existing SWO rows when available instead of blindly using the first PWO.

### 21. SWO setup may need a different FG, not just a different PWO
- Problem: Some FGs have PWOs but none of those PWOs contain any SWO rows, so searching only within the first FG still leaves the suite in an empty state.
- Seen in: SWO revalidation snapshots on 2026-03-31
- Rule: For SWO coverage, choose a full FG->PWO path that already has SWOs instead of assuming the first FG can support all SWO assertions.

### 22. Do not replace a passing setup path with a broader heuristic without re-verifying the first smoke case
- Problem: A broader fallback search can accidentally destabilize a setup path that was already passing on the current branch.
- Seen in: SWO revalidation on 2026-03-31 after FG-level context broadening
- Rule: When a targeted setup fix already gets `E2E-001` passing, keep that path as the baseline and validate any broader search change with the first smoke test before using it for the full suite.

### 23. Do not treat `expect.poll()` like a plain promise
- Problem: Chaining `.catch()` directly onto `expect.poll()` causes an immediate runtime error instead of a controlled fallback path.
- Seen in: SWO revalidation on 2026-03-31
- Rule: Wrap `expect.poll()` in a normal `try/catch` block when a fallback branch is needed.

### 24. Long per-candidate waits can exhaust hook timeouts
- Problem: A context-selection helper that waits several seconds for every candidate row can consume the whole `beforeEach` timeout before any test body starts.
- Seen in: SWO revalidation on 2026-03-31
- Rule: In setup scans, use a fast snapshot of candidates plus short per-candidate waits, then fall back cleanly instead of probing each candidate for too long.

### 25. SWO edit flows can hit the same duplicate-name strict-mode issue as PWO
- Problem: Reused environments can contain multiple SWO rows with the same visible name, so edit/preload helpers that expect one exact match fail in strict mode.
- Seen in: SWO-E2E-011, `012`, and `013` on 2026-03-31
- Rule: For existing SWO edit flows, target the first matching row or create a unique SWO specifically for the edit scenario instead of assuming name uniqueness.

### 26. Pending workbook/PDF gap cases must not depend on heavy shared setup
- Problem: A suite can mark cases as `fixme` but still fail before the test body runs if a shared `beforeEach` performs expensive navigation or data discovery.
- Seen in: Manage WRCF Skills on 2026-03-31
- Rule: Keep environment-heavy setup inside only the executable tests, or gate it so pending/blocker cases are skipped immediately without inheriting the setup cost.

### 27. Manage WRCF Skills may have no local industry path that resolves FG options
- Problem: The local environment can expose sectors and industries on `/industry-wrcf` while every discovered `industryId` still loads `/wrcf-skills` with no Functional Group options.
- Seen in: Manage WRCF Skills reruns on 2026-03-31
- Rule: Treat missing `industryId -> FG options` resolution as an environment/data blocker for executable manage-skills cases. Document it and avoid failing the whole suite in `beforeEach`.

### 28. Permanent skip/fixme hides future coverage too well
- Problem: Future or not-yet-implemented tests can become invisible for too long when kept under permanent `skip`/`fixme`.
- Rule: Keep future coverage visible in the same spec using tags/grouping, and exclude it from default runs instead of permanently muting it.

### 29. Runtime/data blockers must not be modeled as future-feature coverage
- Problem: A suite can blur together “feature not ready yet” and “current runtime or seed data is missing,” which makes stable failures and future coverage harder to reason about.
- Rule: Use `@future` only for not-yet-implemented or intentionally deferred behavior. Track current runtime/data blockers separately with docs, progress-log entries, and optional tags such as `@blocked-runtime` or `@blocked-data`.

### 30. Future coverage should avoid inherited heavy setup
- Problem: A future-only test group can consume time in `beforeEach` or shared discovery even though the default runner excludes it.
- Rule: Keep expensive setup inside the tagged future tests that need it, or share only lightweight auth/page setup across the file.

## Add New Entries Like This
- Pattern:
- Seen in:
- Root cause:
- Fix:
- Prevention rule:
