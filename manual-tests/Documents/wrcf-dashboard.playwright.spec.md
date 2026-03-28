# wrcf-dashboard.playwright.spec

**Source:** `manual-tests/wrcf-dashboard.playwright.spec.ts`

## Purpose

Dashboard coverage for the WRCF overview page, including default landing behavior, filters, cards, version/status display, quick actions, and selected known gaps.

## Covered Tests

- dashboard is default page after login
- default Industry Sector and Industry auto-select on load
- dashboard cards load for default selection
- Industry Sector list order
- Industry list filtering and alphabetical order
- card refresh behavior on Industry and Sector changes
- previous dashboard metrics are not retained after selection changes
- version row fields are visible
- quick action tiles render and current actions behave correctly
- partial zero-count state handled
- inactive filtering and carry-forward behavior are normal failing tests where the product does not yet satisfy the requirement
- unauthorized-user restriction remains pending/skipped

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

- Combines current implemented behavior with requirement checks that may intentionally fail until the product is fixed
- Unauthorized access is still pending because it needs a lower-privilege test user

## Pending Or Blocked Cases

- `unauthorized user cannot access restricted dashboard actions`
  Blocker: a lower-privilege user is not yet available for this coverage.
- version-state alignment, no-draft rendering, no-data rendering, inactive filtering, and carry-forward requirements are present as coverage targets but depend on dashboard behaviors that are not fully implemented in the current build.
