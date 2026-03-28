# Login Page MCP Test Cases

**Date:** March 27, 2026  
**Flow:** Login page  
**Scope:** Unauthenticated UI coverage only  
**Method:** Playwright MCP manual execution against local services  
**Start URL:** `http://localhost:4200`

## Purpose

Use these test cases when running Playwright MCP against the locally running app. They are designed to generate repeatable manual evidence without attempting real sign-in.

## Preconditions

- Frontend is running at `http://localhost:4200`
- BFF is running at `http://localhost:3000`
- Core API is running at `http://localhost:3001`
- Do not seed or use real user credentials
- Do not submit a successful login request

## MCP Execution Notes

- Prefer direct local Chrome mode
- Do not use bridge/extension mode unless explicitly required
- Start from `http://localhost:4200`
- Save screenshots when a visual or UX issue is found

## Test Cases

### TC-LOGIN-001: Initial route redirects to login

**Objective:** Confirm the app opens the unauthenticated login experience.

**Steps**
1. Navigate to `http://localhost:4200`
2. Wait for the page to finish rendering
3. Record the final URL

**Expected Results**
- The page resolves to `/login` with a `returnUrl` query parameter
- The main heading reads `Sign in`

**Suggested MCP Prompt**
```text
Use Playwright MCP to open http://localhost:4200. Wait for the page to finish loading, then report the final URL and the main heading text only. Do not sign in.
```

### TC-LOGIN-002: Core login fields render

**Objective:** Verify the primary login form controls are visible.

**Steps**
1. Open the login page
2. Inspect the form fields and labels
3. Confirm placeholders for the email and password inputs

**Expected Results**
- `E-mail` label is visible
- Email input is visible with placeholder `example@gmail.com`
- `Password` label is visible
- Password input is visible with placeholder `@#*%`

**Suggested MCP Prompt**
```text
Use Playwright MCP to inspect the login form at http://localhost:4200. Confirm whether the E-mail label, email input, Password label, and password input are visible, and include each placeholder value. Do not submit the form.
```

### TC-LOGIN-003: Primary actions render

**Objective:** Verify the main action buttons and navigation links are present.

**Steps**
1. Open the login page
2. Inspect the visible actions in and around the form
3. Record the target for each link where available

**Expected Results**
- `Sign in` submit button is visible
- `Sign in with Google` button is visible
- `Create now` link is visible and routes to `/signup`
- `Forgot Password?` link is visible

**Suggested MCP Prompt**
```text
Use Playwright MCP to inspect the actions on the login page at http://localhost:4200. Verify the Sign in button, Sign in with Google button, Create now link, and Forgot Password link. Report the href or route target for the two links if available. Do not activate sign-in.
```

### TC-LOGIN-004: Keyboard tab order is logical

**Objective:** Verify keyboard-only navigation for the login page.

**Steps**
1. Open the login page
2. Press `Tab` repeatedly from the top of the page
3. Record the focused element after each press until the main controls are covered

**Expected Results**
- Focus order is logical and consistent
- No focus trap occurs
- Expected observed order:
  `Create now -> E-mail -> Password -> Show -> Remember me -> Forgot Password? -> Sign in -> Sign in with Google`

**Suggested MCP Prompt**
```text
Use Playwright MCP to test keyboard navigation on http://localhost:4200. Press Tab through each interactive control on the login page and report the focus order in sequence. Do not submit the form.
```

### TC-LOGIN-005: Validation and helper text behavior

**Objective:** Capture current validation timing and clarity without authenticating.

**Steps**
1. Open the login page
2. Focus the email field, then blur it without entering a value
3. Repeat for the password field
4. Type invalid or partial values and observe helper/error text

**Expected Results**
- Validation behavior is observable without sign-in
- Any helper or error text is documented exactly as rendered
- No successful auth flow is attempted

**Suggested MCP Prompt**
```text
Use Playwright MCP to inspect validation behavior on the login page at http://localhost:4200 without signing in. Blur the email and password fields, type partial invalid values, and report when validation messages appear and what they say.
```

### TC-LOGIN-006: UX and accessibility spot check

**Objective:** Capture visual clarity and low-risk UX issues.

**Steps**
1. Open the login page
2. Review placeholder clarity, button/link distinction, and viewport fit
3. Scroll if needed and take screenshots

**Expected Results**
- Heading and controls remain readable
- Buttons and links are visually distinct
- Any UX gaps are recorded with impact and recommendation

**Suggested MCP Prompt**
```text
Use Playwright MCP to perform a UX and accessibility spot check of the login page at http://localhost:4200. Review placeholder clarity, distinguishability of links vs buttons, viewport fit, and any obvious accessibility issues. Take screenshots if you find anything notable. Do not attempt real authentication.
```

## Reporting Format

Use this structure when converting MCP findings into markdown artifacts:

```markdown
### Finding: [Short title]
- Severity: Minor | Major | Critical
- Observation: [What happened]
- Impact: [Why it matters]
- Recommendation: [What to change]
- Evidence: [Screenshot, DOM note, or MCP observation]
```

## Current Baseline

- Login smoke coverage has already been observed as passing
- Current known UX gaps:
  - Password placeholder is unclear
  - Forgot Password link is not implemented yet
  - Validation timing may need product clarification
