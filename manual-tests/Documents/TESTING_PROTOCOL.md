# Manual Testing Protocol and Status

**Last Updated:** March 27, 2026  
**Status:** In progress  
**Primary Focus:** Unauthenticated flows via Playwright MCP

## Objective

Turn local Playwright MCP exploration into repeatable repo artifacts that can be reviewed, rerun, and extended later.

## Current Scope

- In scope:
  - Login page
  - Signup page
  - Other unauthenticated entry flows approved for local inspection
- Out of scope:
  - Real authentication
  - Real account creation
  - Password recovery completion if the feature is not implemented

## Required Local Services

Run these before MCP-based testing:

```bash
pnpm start:web-admin
pnpm dev:bff
pnpm dev:core-api
```

Expected local endpoints:

- Frontend: `http://localhost:4200`
- BFF: `http://localhost:3000`
- Core API: `http://localhost:3001`

## Environment

- Use the local root `.env` file for runtime configuration
- Do not commit `.env`
- Keep testing aligned with local service behavior rather than external auth dependencies

## MCP Setup Used

- Preferred mode: direct local Chrome
- Avoid bridge mode unless there is a specific need
- Prior successful validation:
  - Opened `http://localhost:4200`
  - Confirmed the main heading text was `Sign in`

## Standard Workflow

### 1. Confirm app readiness

- Verify the frontend is already running on port `4200`
- Avoid starting a duplicate frontend server
- Confirm the login page is reachable before deeper inspection

### 2. Execute MCP manual test cases

- Use a flow-specific case sheet when available
- For login, start with [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md)
- Keep prompts focused on structure, navigation, validation, and UX

### 3. Save findings as markdown

Use a consistent report shape:

```markdown
## Scenario
## Steps Performed
## Results
## Issues Found
## Scope Notes
```

### 4. Convert stable checks into Playwright coverage

- Add or update a focused `@playwright/test` spec
- Keep assertions limited to unauthenticated behavior
- Do not automate real sign-in until the product is ready

## Current Artifacts

- [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md)
- [login-page-smoke-test.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-smoke-test.md)
- [login-page-accessibility-and-ux-findings.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-accessibility-and-ux-findings.md)
- [login-page.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page.playwright.spec.ts)

## Known UX Gaps

- Password placeholder wording is unclear
- Forgot Password link is visible but not implemented
- Validation timing may need product clarification

## Current Status

### Completed

- Login page smoke coverage documented
- Login page UX and accessibility observations documented
- Login page repeatable smoke spec drafted

### Next

- Inspect the signup page from the `Create now` link
- Record fields, tab order, validation timing, and UX issues
- Avoid final registration submission

## Limitations

- This workspace copy does not include the WSL `.vscode/mcp.json` that was referenced in prior notes
- Root `package.json` does not currently include `@playwright/test`
- Manual testing remains the source of truth until Playwright CLI support is added and verified locally
