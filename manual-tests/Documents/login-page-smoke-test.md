# Login Page Smoke Test

**Date:** March 27, 2026  
**Scope:** Unauthenticated login page  
**Method:** Playwright MCP manual inspection  
**Start URL:** `http://localhost:4200`

## Scenario

Verify that the Whizard Admin login page loads successfully and that all primary unauthenticated UI elements are present.

## Environment Requirements

- Frontend running at `http://localhost:4200`
- BFF running at `http://localhost:3000`
- Core API running at `http://localhost:3001`
- No authenticated user session required

## Steps Performed

1. Navigated to `http://localhost:4200`
2. Waited for the page redirect and initial render to complete
3. Inspected the page structure and visible controls with Playwright MCP
4. Confirmed the presence of the expected heading, fields, buttons, and links

## Results

### PASS: Route and page load

- Expected: App redirects unauthenticated users to `/login?returnUrl=%2Fdashboard`
- Actual: Redirect reached the login page successfully

### PASS: Main heading

- Expected: Visible `h1` with text `Sign in`
- Actual: Heading rendered as expected

### PASS: Email field

- Expected: Email input is visible and usable
- Actual: Email input rendered with placeholder `example@gmail.com`

### PASS: Password field

- Expected: Password input is visible and usable
- Actual: Password input rendered with placeholder `@#*%`

### PASS: Sign in button

- Expected: Submit button is present for credentials entry
- Actual: `Sign in` button is visible

### PASS: Google sign-in option

- Expected: Secondary sign-in action is visible
- Actual: `Sign in with Google` button is visible

### PASS: Create account link

- Expected: Link to the signup flow is present
- Actual: `Create now` link routes to `/signup`

### PASS: Forgot Password link

- Expected: Password recovery entry point is visible
- Actual: `Forgot Password?` link is visible

## Issues Found

No blocking smoke issues were found in this pass.

## Scope Notes

- No real authentication was attempted
- This report covers UI presence and route behavior only
- Deeper UX and accessibility observations are tracked in [login-page-accessibility-and-ux-findings.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-accessibility-and-ux-findings.md)
- MCP execution prompts are captured in [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md)
