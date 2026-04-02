# login-page-auth.playwright.spec

**Source:** `manual-tests/login-page-auth.playwright.spec.ts`

## Purpose

Credentialed login coverage for the admin login page using runtime environment variables.

## Covered Tests

- signs in with valid credentials

## Flow Diagram

```text
Open /login
  -> fill E-mail
  -> fill Password
  -> click Sign in
  -> confirm URL leaves /login
  -> confirm login screen is no longer visible
```

## Notes

- Requires `TEST_LOGIN_EMAIL` and `TEST_LOGIN_PASSWORD`
- Credentials are not stored in the repo
- No skipped cases are tracked in this spec; the main runtime blocker is unavailable or invalid test credentials
