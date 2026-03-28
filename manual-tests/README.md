# Manual Tests

This directory stores manual Playwright MCP findings and the repo artifacts derived from them.

## Current Artifacts

```text
manual-tests/
  README.md
  TESTING_PROTOCOL.md
  login-page-mcp-test-cases.md
  login-page-smoke-test.md
  login-page-accessibility-and-ux-findings.md
  login-page.playwright.spec.ts
```

## Current Scope

- Focus on unauthenticated flows only
- Do not attempt real sign-in
- Do not create a real account unless explicitly requested
- Prefer Playwright MCP for manual inspection and `@playwright/test` for repeatable smoke coverage

## Login Page Status

- Smoke test: complete
- Accessibility and UX review: complete
- Known issues: 3 minor findings
- Repeatable test artifact: drafted in [login-page.playwright.spec.ts](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page.playwright.spec.ts)

## Recommended Workflow

1. Start the local app services.
2. Run the MCP prompts from [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md).
3. Save findings into a flow-specific markdown report.
4. Convert stable checks into or update a Playwright spec.
5. Update [TESTING_PROTOCOL.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/TESTING_PROTOCOL.md) when the process changes.

## Local Services

- Frontend: `http://localhost:4200`
- BFF: `http://localhost:3000`
- Core API: `http://localhost:3001`

## Useful References

- Protocol: [TESTING_PROTOCOL.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/TESTING_PROTOCOL.md)
- Login smoke report: [login-page-smoke-test.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-smoke-test.md)
- Login UX report: [login-page-accessibility-and-ux-findings.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-accessibility-and-ux-findings.md)
- MCP test cases: [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md)

## Notes

- The WSL MCP config referenced in prior notes is not present in this Windows workspace copy
- `@playwright/test` is not currently declared in the root `package.json`
- The next recommended manual target is the signup page reached from `Create now`
