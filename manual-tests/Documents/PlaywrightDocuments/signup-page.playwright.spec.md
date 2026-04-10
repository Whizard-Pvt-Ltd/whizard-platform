# signup-page.playwright.spec

**Source:** `manual-tests/signup-page.playwright.spec.ts`

## Purpose

Sheet-aligned SignIn coverage for the Create Account page.

## Covered Tests

- `SIGNUP-E2E-001` signup page load
- `SIGNUP-E2E-002` Sign in link navigation
- `SIGNUP-E2E-003` full name validation
- `SIGNUP-E2E-004` signup email validation
- `SIGNUP-E2E-005` signup password minimum length
- `SIGNUP-E2E-006` confirm password required
- `SIGNUP-E2E-007` password mismatch
- `SIGNUP-E2E-008` terms required
- `SIGNUP-E2E-009` signup password visibility toggle
- `SIGNUP-E2E-010` confirm password visibility toggle
- `SIGNUP-E2E-011` authored future signup-success case

## Flow Diagram

```text
Open /signup
  -> verify branding and form fields
  -> verify Sign in navigation
  -> validate name/email/password/confirm/terms rules
  -> validate password visibility toggles
  -> keep signup-success as future until repeatable local provisioning is confirmed
```

## Notes

- Targets the shared Create Account UI rendered on `/signup`
- Keeps real account creation separate until a safe repeatable local signup path is confirmed
