# Playwright Run Commands

This file is the quick copy-paste reference for running the current `manual-tests/` specs from a bash shell.

Preferred workflow:
- use these commands for large/full-suite or repeated reruns and paste the output back into Codex
- use Codex-run mainly for short targeted reruns, reproducing a few failures, or validating a fresh patch

## Authenticated Runs

Most WRCF suites need credentials.

Set them inline per command:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' <command>
```

Or export them once per terminal:

```bash
export TEST_LOGIN_EMAIL='sandeeps@whizard.com'
export TEST_LOGIN_PASSWORD='Whizard@123'
```

## Tag-Based Runs

Run the default Playwright set. `@future` is included in normal runs.

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:playwright:stable
```

Run only stable `@p0` coverage.

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:playwright:stable:p0
```

Run only authored `@future` coverage explicitly.

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:playwright:future
```

Run a particular tag:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep @p0
```

Run tests that match more than one tag by regex:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep "(?=.*@stable)(?=.*@p1)"
```

Run a particular module tag:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test --grep @task
```

Run stable `@p0` tests only for Task:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@stable)(?=.*@p0)(?=.*@task)"
```

Run stable `@p1` tests only for Task:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@stable)(?=.*@p1)(?=.*@task)"
```

Run future Task coverage only:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' PW_INCLUDE_FUTURE=1 corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts --grep "(?=.*@future)(?=.*@task)"
```

Important:
- tag filtering only works for specs that already contain real Playwright tags
- right now `wrcf_Task.playwright.spec.ts` is the clearest fully migrated example
- `wrcf-manage-wrcf.playwright.spec.ts` also has `@stable` and `@future`
- `wrcf_Functional_Group.playwright.spec.ts` is not tag-migrated yet, so workbook tags for FG are planning metadata only right now

## Ordered WRCF Reports

These generate the repo's ordered `.md`, `.csv`, and custom `.html` outputs.

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:wrcf:dashboard:ordered
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:wrcf:manage-wrcf:ordered
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm test:wrcf:functional-group:ordered
```

## Run All In One Go

Run all current WRCF suites in one command:

```bash
export TEST_LOGIN_EMAIL='sandeeps@whizard.com'
export TEST_LOGIN_PASSWORD='Whizard@123'
corepack pnpm exec playwright test manual-tests/wrcf*.playwright.spec.ts manual-tests/wrcf_*.playwright.spec.ts --workers=1
```

Run everything under `manual-tests/` in one command:

```bash
export TEST_LOGIN_EMAIL='sandeeps@whizard.com'
export TEST_LOGIN_PASSWORD='Whizard@123'
corepack pnpm exec playwright test manual-tests --workers=1
```

## Direct Spec Runs

Copy-paste sheet for running each WRCF suite one by one:

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

Login page smoke:

```bash
corepack pnpm exec playwright test manual-tests/login-page.playwright.spec.ts
```

Login page auth:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/login-page-auth.playwright.spec.ts
```

Dashboard:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf-dashboard.playwright.spec.ts
```

Dashboard tagged stable slice:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --grep @stable
```

Manage WRCF:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf-manage-wrcf.playwright.spec.ts
```

Functional Group:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Functional_Group.playwright.spec.ts
```

Primary Work Object:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Primary_Work_Object.playwright.spec.ts
```

Secondary Work Object:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Secondary_Work_Object.playwright.spec.ts
```

CI Mapping:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_CI_Mapping.playwright.spec.ts
```

Manage WRCF Skills:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Manage_WRCF_Skills.playwright.spec.ts
```

Skills:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Skills.playwright.spec.ts
```

Task:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Task.playwright.spec.ts
```

Control Point:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf_Control_Point.playwright.spec.ts
```

## HTML Report Runs

Run a spec with Playwright's default HTML report:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --reporter=html
```

Run the same spec in headed mode:

```bash
TEST_LOGIN_EMAIL='sandeeps@whizard.com' TEST_LOGIN_PASSWORD='Whizard@123' corepack pnpm exec playwright test manual-tests/wrcf-dashboard.playwright.spec.ts --headed --reporter=html
```

Open the Playwright HTML report:

```bash
corepack pnpm exec playwright show-report
```

## Notes

- Current normal runs include `@future` unless you explicitly filter it out.
- Workbook tag meanings and maintenance rules are documented in [workbook-tagging-guide.md](/home/sama/new-repo/whizard-platform/manual-tests/Documents/workbook-tagging-guide.md).
