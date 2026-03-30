# Implementation Plan: WRCF Industry Default Selection

## Problem
`navigateToRoles()` in the dashboard navigates to `/wrcf-roles` with no parameters. The WRCF Roles component ignores query params entirely. The Industry WRCF component reads query params and loads FGs but does not auto-cascade (auto-select first FG → load PWOs → auto-select first PWO → load SWOs → auto-select first SWO).

## Approach
Pass `sectorId` and `industryId` as router query params from the dashboard. Destination pages read them via `ActivatedRoute`, pre-select filters, and trigger cascade loads.

## Files to Modify

### 1. `apps/web/admin-portal/src/app/pages/wrcf-dashboard/wrcf-dashboard.component.ts`
- Update `navigateToRoles()` to include `queryParams: { sectorId, industryId }` from current form control values

### 2. `apps/web/admin-portal/src/app/pages/industry-wrcf/industry-wrcf.component.ts`
- In `ngOnInit`, after FGs are loaded (param-driven path), add cascade auto-selection:
  - Auto-select `fgs[0]` → load PWOs → auto-select `pwos[0]` → load SWOs → auto-select `swos[0]`
- User-interaction handlers (`onFGSelect`, `onPWOSelect`, `onSWOSelect`) remain unchanged

### 3. `apps/web/admin-portal/src/app/pages/wrcf-roles/wrcf-roles.component.ts`
- Inject `ActivatedRoute`
- In `ngOnInit`, read `sectorId` + `industryId` from query params
- If `sectorId` present: load industries for that sector (instead of `sectors[0]`)
- If `industryId` found in loaded industries: call `selectIndustry(industryId)` directly
- Fall back to default behaviour when no params
- **Auto-select cascade** (already wired via existing methods — fires automatically when `selectIndustry` is called):
  - `selectIndustry` → loads FGs + departments → auto-selects `depts[0]` via `selectDepartment`
  - `selectDepartment` → filters dept FGs → auto-selects `fgs[0]` via `onFGSelect`
  - `onFGSelect` → loads PWOs → auto-selects `pwos[0]` via `onPWOSelect`
  - `onPWOSelect` → loads SWOs → auto-selects `swos[0]` via `onSWOSelect`
