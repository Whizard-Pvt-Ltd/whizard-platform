# Manual Tests

This directory stores manual Playwright MCP findings and the repo artifacts derived from them.

## Current Artifacts

```text
manual-tests/
  README.md
  Documents/
    TESTING_PROTOCOL.md
    login-page-mcp-test-cases.md
    login-page-smoke-test.md
    login-page-accessibility-and-ux-findings.md
    login-page.playwright.spec.md
    login-page-auth.playwright.spec.md
    wrcf-manage-wrcf.playwright.spec.md
    wrcf-dashboard.playwright.spec.md
    wrcf_Functional_Group.playwright.spec.md
    wrcf_Primary_Work_Object.playwright.spec.md
    wrcf_Secondary_Work_Object.playwright.spec.md
  login-page.playwright.spec.ts
  login-page-auth.playwright.spec.ts
  wrcf-manage-wrcf.playwright.spec.ts
  wrcf-dashboard.playwright.spec.ts
  wrcf_Functional_Group.playwright.spec.ts
  wrcf_Primary_Work_Object.playwright.spec.ts
  wrcf_Secondary_Work_Object.playwright.spec.ts
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
- [wrcf_Primary_Work_Object.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts): sheet-driven Primary Work Object coverage aligned to the `PWO` tab in the reverified workbook.
- [wrcf_Secondary_Work_Object.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts): sheet-driven Secondary Work Object coverage aligned to the `SWO` tab in the reverified workbook.

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

- Protocol: [TESTING_PROTOCOL.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/TESTING_PROTOCOL.md)
- Login smoke report: [login-page-smoke-test.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-smoke-test.md)
- Login UX report: [login-page-accessibility-and-ux-findings.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-accessibility-and-ux-findings.md)
- MCP test cases: [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/login-page-mcp-test-cases.md)
- Ordered FG results: [wrcf-functional-group-results.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/results/wrcf-functional-group-results.md)
- PWO companion doc: [wrcf_Primary_Work_Object.playwright.spec.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/wrcf_Primary_Work_Object.playwright.spec.md)
- SWO companion doc: [wrcf_Secondary_Work_Object.playwright.spec.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/Documents/wrcf_Secondary_Work_Object.playwright.spec.md)

## Notes

- The WSL MCP config referenced in prior notes is not present in this Windows workspace copy.
- Runtime auth cache is stored under `manual-tests/.auth/` and is gitignored.
- Ordered result exports are generated into `manual-tests/results/`.
