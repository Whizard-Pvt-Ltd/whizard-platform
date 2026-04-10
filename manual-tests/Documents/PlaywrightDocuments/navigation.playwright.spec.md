# navigation.playwright.spec

**Source:** `manual-tests/navigation.playwright.spec.ts`

## Purpose

Sheet-aligned navigation bug coverage for sidebar active-state behavior.

## Covered Tests

- `NAV-MBUG-001` only the active Manage Company menu item is highlighted

## Flow Diagram

```text
Login
  -> open /manage-company
  -> inspect sidebar active state
  -> confirm only one menu item is highlighted
```

## Notes

- Uses the shared layout sidebar active-state class
- Fails truthfully if multiple menu items are highlighted at the same time
