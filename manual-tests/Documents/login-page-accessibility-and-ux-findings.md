# Login Page Accessibility and UX Findings

**Date:** March 27, 2026  
**Scope:** Keyboard navigation, form clarity, and visual usability  
**Method:** Playwright MCP manual inspection  
**Start URL:** `http://localhost:4200`

## Scenario

Perform a deeper manual review of the login page to evaluate keyboard flow, field clarity, visual hierarchy, and low-risk accessibility concerns without attempting sign-in.

## Areas Reviewed

- Keyboard tab order
- Labels and placeholders
- Distinction between links and buttons
- Viewport fit and scrolling behavior
- Validation visibility and message timing

## Observed Tab Order

`Create now -> E-mail -> Password -> Show -> Remember me -> Forgot Password? -> Sign in -> Sign in with Google`

## Findings

### PASS: Keyboard navigation

- The focus order is logical and predictable
- All key interactive controls were reachable with `Tab`
- No focus traps were observed during the pass

### PASS: Visual hierarchy

- The page clearly distinguishes links from buttons
- The primary submit action stands out from the secondary Google sign-in action
- The layout reads cleanly without requiring horizontal scrolling

### PASS: Basic readability

- Heading and form labels are readable
- The page remains usable within a standard desktop viewport
- Error text is visually noticeable when shown

## Issues

### Finding: Password placeholder clarity

- Severity: Minor
- Observation: The password placeholder is `@#*%`, which does not explain the expected input clearly
- Impact: Users may not understand whether the field expects a format, a minimum length, or simply a password
- Recommendation: Replace the placeholder with clearer guidance such as `8+ characters` or wording that matches the true requirement

### Finding: Forgot Password link is not implemented

- Severity: Minor
- Observation: The `Forgot Password?` link is visible but currently points to `#`
- Impact: Users are presented with a recovery option that does not lead anywhere
- Recommendation: Route the link to the intended recovery flow or hide/disable it until the feature exists

### Finding: Validation timing may need clarification

- Severity: Minor
- Observation: Validation messaging appears during entry and can remain visible when fields are empty
- Impact: The experience may feel premature or inconsistent if the intended product behavior is validation on blur or submit
- Recommendation: Confirm the intended validation model with product/design and align the form behavior to that decision

## Overall Assessment

No critical accessibility blockers were identified in this manual pass. The login page is a solid baseline for unauthenticated form testing, with a few clear UX follow-ups that should be easy to track.

## Evidence Notes

- Screenshots previously referenced: `login-page-full.png`, `login-page-scrolled.png`
- Smoke coverage summary: [login-page-smoke-test.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-smoke-test.md)
- MCP case definitions: [login-page-mcp-test-cases.md](/c:/Users/sande/OneDrive/Documents/Codex/whizard-platform/manual-tests/login-page-mcp-test-cases.md)
