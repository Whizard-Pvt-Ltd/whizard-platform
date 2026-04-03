# Manual Tests

This directory stores manual Playwright MCP findings and the repo artifacts derived from the WRCF PDF specifications plus workbook-backed test-case mapping.

## Current Artifacts

```text
manual-tests/
  README.md
  Documents/
    README.md
    PlaywrightDocuments/
      README.md
      login-page.playwright.spec.md
      login-page-auth.playwright.spec.md
      wrcf-manage-wrcf.playwright.spec.md
      wrcf-dashboard.playwright.spec.md
      wrcf_Functional_Group.playwright.spec.md
      wrcf_Primary_Work_Object.playwright.spec.md
      wrcf_Secondary_Work_Object.playwright.spec.md
      wrcf_Manage_WRCF_Skills.playwright.spec.md
      wrcf_Skills.playwright.spec.md
      wrcf_Task.playwright.spec.md
      wrcf_Control_Point.playwright.spec.md
    TESTING_PROTOCOL.md
    playwright-run-commands.md
    workbook-tagging-guide.md
    login-page-mcp-test-cases.md
    login-page-smoke-test.md
    login-page-accessibility-and-ux-findings.md
    wrcf-source-of-truth.md
  login-page.playwright.spec.ts
  login-page-auth.playwright.spec.ts
  wrcf-manage-wrcf.playwright.spec.ts
  wrcf-dashboard.playwright.spec.ts
  wrcf_Functional_Group.playwright.spec.ts
  wrcf_Primary_Work_Object.playwright.spec.ts
  wrcf_Secondary_Work_Object.playwright.spec.ts
  wrcf_Manage_WRCF_Skills.playwright.spec.ts
  wrcf_Skills.playwright.spec.ts
  wrcf_Task.playwright.spec.ts
  wrcf_Control_Point.playwright.spec.ts
  results/
```

## Current Scope

- Focus on unauthenticated flows only
- Do not attempt real sign-in
- Do not create a real account unless explicitly requested
- Prefer Playwright MCP for manual inspection and `@playwright/test` for repeatable smoke coverage

## Playwright Specs

- [login-page.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page.playwright.spec.ts): unauthenticated login page smoke coverage for visible controls and tab order.
- [login-page-auth.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-auth.playwright.spec.ts): credentialed login sanity check using runtime environment variables.
- [wrcf-manage-wrcf.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf-manage-wrcf.playwright.spec.ts): Manage WRCF create/edit flow coverage for Functional Group, PWO, and SWO.
- [wrcf-dashboard.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf-dashboard.playwright.spec.ts): dashboard filter, metrics, quick-action, and known-gap coverage.
- [wrcf_Functional_Group.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Functional_Group.playwright.spec.ts): sheet-driven Functional Group coverage aligned to FG `G/H` steps and expected results.
- [wrcf_Primary_Work_Object.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts): PDF-backed Primary Work Object coverage traced to the `PWO` workbook tab.
- [wrcf_Secondary_Work_Object.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts): PDF-backed Secondary Work Object coverage traced to the `SWO` workbook tab.
- [wrcf_Manage_WRCF_Skills.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Manage_WRCF_Skills.playwright.spec.ts): PDF-backed Manage Skills parent-context coverage traced to the `Manage WRCF Skills` workbook tab.
- [wrcf_Skills.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Skills.playwright.spec.ts): PDF-backed Skills coverage traced to the `Skills` workbook tab.
- [wrcf_Task.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Task.playwright.spec.ts): PDF-backed Task coverage traced to the `Task` workbook tab.
- [wrcf_Control_Point.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Control_Point.playwright.spec.ts): PDF-backed Control Point coverage traced to the `Control Point` workbook tab.

## Recommended Workflow

1. Start the local app services.
2. Run the MCP prompts from [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-mcp-test-cases.md).
3. Save findings into a flow-specific markdown report.
4. Convert stable checks into or update a Playwright spec.
5. Update [TESTING_PROTOCOL.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/TESTING_PROTOCOL.md) when the process changes.

## Local Services

- Frontend: `http://localhost:4200`
- BFF: `http://localhost:3000`
- Core API: `http://localhost:3001`

## How To Run

Quick command reference:
- Bash commands for each current spec: [playwright-run-commands.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/playwright-run-commands.md)
- Workbook execution-tag maintenance: [workbook-tagging-guide.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/workbook-tagging-guide.md)
- Document map for this folder: [README.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/README.md)
- Playwright companion docs: [README.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/README.md)

Set the login credentials in the same PowerShell window before running any authenticated Playwright suite:

```powershell
$env:TEST_LOGIN_EMAIL='sandeeps@whizard.com'
$env:TEST_LOGIN_PASSWORD='Whizard@123'
```

Run the ordered WRCF suites with live terminal progress and regenerated `.md`, `.csv`, and custom `.html` outputs:

```powershell
corepack pnpm test:wrcf:dashboard:ordered
corepack pnpm test:wrcf:manage-wrcf:ordered
corepack pnpm test:wrcf:functional-group:ordered
```

Run the default Playwright set. This includes `@future` coverage unless you explicitly filter it out:

```powershell
corepack pnpm test:playwright:stable
```

Run only stable critical coverage tagged `@stable @p0`:

```powershell
corepack pnpm test:playwright:stable:p0
```

Run only authored future coverage explicitly:

```powershell
corepack pnpm test:playwright:future
```

Run all current WRCF suites in one go:

```powershell
corepack pnpm exec playwright test manual-tests/wrcf*.playwright.spec.ts manual-tests/wrcf_*.playwright.spec.ts --workers=1
```

Run everything under `manual-tests/` in one go:

```powershell
corepack pnpm exec playwright test manual-tests --workers=1
```

Run a particular tag when the target spec is tag-migrated:

```powershell
corepack pnpm exec playwright test --grep @p0
corepack pnpm exec playwright test --grep "(?=.*@stable)(?=.*@p1)"
corepack pnpm exec playwright test --grep @task
```

Example: run `@p0` Task coverage only:

```powershell
corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@stable)(?=.*@p0)(?=.*@task)"
```

If you want to run directly with Playwright from bash, use the same `--grep` examples:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep @p0
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep "(?=.*@stable)(?=.*@p1)"
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep @task
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@stable)(?=.*@p0)(?=.*@task)"
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' PW_INCLUDE_FUTURE=1 corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@future)(?=.*@task)"
```

Copy-paste bash sheet for running each WRCF suite one by one:

```bash
export TEST_LOGIN_EMAIL='sandeeps@whizard.com'
export TEST_LOGIN_PASSWORD='Whizard@123'

# All WRCF suites
corepack pnpm exec playwright test manual-tests/wrcf*.playwright.spec.ts manual-tests/wrcf_*.playwright.spec.ts --workers=1

# Dashboard
corepack pnpm exec playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --workers=1

# Manage WRCF
corepack pnpm exec playwright test manual-tests/wrcf-manage-wrcf.playwright.spec.ts --workers=1

# Functional Group
corepack pnpm exec playwright test manual-tests/wrcf_Functional_Group.playwright.spec.ts --workers=1

# Primary Work Object
corepack pnpm exec playwright test manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts --workers=1

# Secondary Work Object
corepack pnpm exec playwright test manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts --workers=1

# CI Mapping
corepack pnpm exec playwright test manual-tests/wrcf_CI_Mapping.playwright.spec.ts --workers=1

# Manage WRCF Skills
corepack pnpm exec playwright test manual-tests/wrcf_Manage_WRCF_Skills.playwright.spec.ts --workers=1

# Skills
corepack pnpm exec playwright test manual-tests/wrcf_Skills.playwright.spec.ts --workers=1

# Task
corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --workers=1

# Control Point
corepack pnpm exec playwright test manual-tests/wrcf_Control_Point.playwright.spec.ts --workers=1
```

Important:
- tag filtering only works for specs that already contain those Playwright tags
- `wrcf_Task.playwright.spec.ts` is fully tag-migrated
- `wrcf-manage-wrcf.playwright.spec.ts` is also tag-migrated for stable/future
- `wrcf_Functional_Group.playwright.spec.ts` is not tag-migrated yet, so workbook tags on FG are tracking metadata only for now

If you are running from bash/WSL instead of PowerShell, use the bash command sheet above. It includes copy-paste commands for each current spec plus stable/future tag runs.

Run a spec directly with Playwright when you want the default Playwright runner behavior:

```powershell
npx playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --reporter=html
```

This command:

- runs the selected spec in Playwright's normal headless mode
- generates the default Playwright HTML report
- is useful when you want the built-in Playwright trace/screenshot/error drill-down view

Run the same spec in headed mode when you want to watch the browser:

```powershell
npx playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --headed --reporter=html
```

This command:

- does the same test run
- opens a visible browser window while the test executes
- is useful for debugging timing, selectors, redirects, and visual UI behavior

Open the default Playwright HTML report after either run:

```powershell
npx playwright show-report
```

Generate the ordered custom reports (`.md`, `.csv`, `.html`) by using the ordered runner commands. These run the suite, save a raw report, and then build the ordered outputs under `manual-tests/results/`.

These commands:

- run the matching Playwright spec
- show `RUN`, `PASSED`, `FAILED`, and `SKIPPED` progress live in the terminal
- regenerate ordered result files in `manual-tests/results/`

Generated ordered outputs:

- Dashboard: [wrcf-dashboard-results.html](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-dashboard-results.html)
- Manage WRCF: [wrcf-manage-wrcf-results.html](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-manage-wrcf-results.html)
- Functional Group: [wrcf-functional-group-results.html](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-functional-group-results.html)

If you want the raw Playwright HTML report instead of the ordered custom report, run a spec directly:

```powershell
npx playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --reporter=html
npx playwright show-report
```

## Useful References

- Source rules: [wrcf-source-of-truth.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/wrcf-source-of-truth.md)
- Protocol: [TESTING_PROTOCOL.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/TESTING_PROTOCOL.md)
- Login smoke report: [login-page-smoke-test.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-smoke-test.md)
- Login UX report: [login-page-accessibility-and-ux-findings.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-accessibility-and-ux-findings.md)
- MCP test cases: [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-mcp-test-cases.md)
- Ordered FG results: [wrcf-functional-group-results.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-functional-group-results.md)
- PWO companion doc: [wrcf_Primary_Work_Object.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Primary_Work_Object.playwright.spec.md)
- SWO companion doc: [wrcf_Secondary_Work_Object.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Secondary_Work_Object.playwright.spec.md)
- Manage Skills companion doc: [wrcf_Manage_WRCF_Skills.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Manage_WRCF_Skills.playwright.spec.md)
- Skills companion doc: [wrcf_Skills.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Skills.playwright.spec.md)
- Task companion doc: [wrcf_Task.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Task.playwright.spec.md)
- Control Point companion doc: [wrcf_Control_Point.playwright.spec.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/PlaywrightDocuments/wrcf_Control_Point.playwright.spec.md)

## Notes

- WRCF behavior and schema come from `temp/WRCF Functional Specs.pdf` and `temp/WRCF definition & Schema.pdf`.
- `temp/WRCF End-to-End Test Cases_reverified.xlsx` is a derived test-case workbook used for IDs and coverage tracking.
- Default-behavior tests stay strict. If a test is specifically checking auto-selection, prefill, or carry-forward behavior, it should fail when that behavior is missing.
- Independent downstream tests should establish their own valid prerequisites when manual reselection does not invalidate the requirement under test.
- The WSL MCP config referenced in prior notes is not present in this Windows workspace copy.
- Runtime auth cache is stored under `manual-tests/.auth/` and is gitignored.
- Ordered result exports are generated into `manual-tests/results/`.


## Stable vs Future Coverage

Some tests may represent future or not-yet-implemented behavior derived from PDFs, screenshots, Figma, or workbook coverage planning.

Execution model:
- Stable tests: included in default runs and should fail if broken
- Future tests: kept visible in the same spec files and included in normal runs unless explicitly filtered out

Recommended approach:
- default run includes future-tagged coverage
- explicit future-only runs can be used when you want a targeted pass
- stable tests should fail normally if broken
- runtime/data blockers should be documented separately from `@future` feature coverage
