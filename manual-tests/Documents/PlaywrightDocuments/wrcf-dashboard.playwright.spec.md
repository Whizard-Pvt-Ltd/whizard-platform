# wrcf-dashboard.playwright.spec

**Source:** `manual-tests/wrcf-dashboard.playwright.spec.ts`

## Purpose

Sheet-aligned dashboard coverage for the `Dashboard` tab in `WRCF End-to-End Test Cases.xlsx`, including all `DASH-E2E-001` through `DASH-E2E-032` entries.

## Covered Tests

- `DASH-E2E-001` through `DASH-E2E-032`
- includes default landing, default filter selection, dashboard card loading, dropdown ordering, refresh behavior, version panel checks, hierarchy/metric cards, quick actions, and carry-forward coverage
- includes dashboard shell/layout checks for load position, filter chrome, quick-action alignment, scrollbar behavior, and profile logout visibility
- current product gaps remain visible as real failures
- authorization coverage remains pending because it needs a lower-privilege user

## Flow Diagram

```text
Login
  -> /dashboard
  -> auto-load default Sector + Industry
  -> fetch dashboard stats
  -> render version row
  -> render metric cards
  -> user changes Sector/Industry
      -> refresh Industry dropdown
      -> refresh cards
  -> quick actions
      -> Edit Structure -> /industry-wrcf
      -> Manage Roles -> /wrcf-roles
      -> Version History dialog
      -> Publish Draft dialog
```

## Notes

- Covers the full dashboard sheet row set with explicit `DASH-E2E-*` IDs
- Combines current implemented behavior with requirement checks that may intentionally fail until the product is fixed
- Default-selection cases stay strict.
- Independent dashboard behavior such as sector filtering, industry filtering, and refresh behavior should establish sector/industry context directly when the UI allows manual reselection.
- Unauthorized access is still pending because it needs a lower-privilege test user

## Pending Or Blocked Cases

- `unauthorized user cannot access restricted dashboard actions`
  Blocker: a lower-privilege user is not yet available for this coverage.
- version-state alignment, no-draft rendering, no-data rendering, inactive filtering, and carry-forward requirements are present as coverage targets but depend on dashboard behaviors that are not fully implemented in the current build.
