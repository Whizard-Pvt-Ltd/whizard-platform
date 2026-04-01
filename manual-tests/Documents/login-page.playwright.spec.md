# login-page.playwright.spec

**Source:** `manual-tests/login-page.playwright.spec.ts`

## Purpose

Smoke coverage for the unauthenticated login page.

## Covered Tests

- renders the login heading
- renders the email field
- renders the password field
- renders the sign-in button
- renders the Google sign-in button
- renders the create account link to signup
- renders the forgot password link
- supports the current keyboard tab order for primary controls

## Flow Diagram

```text
Open /
  -> redirect to /login
  -> verify heading and fields
  -> verify buttons and links
  -> verify keyboard tab order
```

## Notes

- Does not attempt real authentication
- Focuses on UI presence and structure
- No skipped or blocked cases are tracked in this spec right now
