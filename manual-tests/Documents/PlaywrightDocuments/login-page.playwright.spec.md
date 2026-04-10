# login-page.playwright.spec

**Source:** `manual-tests/login-page.playwright.spec.ts`

## Purpose

Sheet-aligned SignIn coverage for the unauthenticated login page.

## Covered Tests

- `LOGIN-E2E-001` login page load with expected auth controls
- `LOGIN-E2E-002` Create now -> signup navigation
- `LOGIN-E2E-003` login email validation
- `LOGIN-E2E-004` blank password validation
- `LOGIN-E2E-005` Remember me default
- `LOGIN-E2E-006` password show/hide toggle

## Flow Diagram

```text
Open /login
  -> verify auth controls and branding
  -> validate Create now navigation
  -> validate email/password UI rules
  -> validate Remember me and password visibility
```

## Notes

- Does not attempt real authentication
- Focuses on UI presence, navigation, and current validation behavior
