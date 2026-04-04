# Full Layout — Implementation Plan

## Overview
Finalise the AdminLayoutComponent shell and apply 4 enhancements across the admin portal:
1. Circular profile avatar in the layout top bar (right corner)
2. Right panel scrolling is fully internal (top-to-bottom) for all detail/form views
3. Page title shown in the layout top bar, derived from the Angular route `title` property
4. Remove filter chips from page headers (future scope); keep all action buttons (Add, Edit, Back, Preview, Save) in the page header

## No DB / API / backend changes

---

## Change 1 — `libs/shared/ui/src/layout/layout.component.ts`
- Top bar always visible (desktop + mobile) — no `lg:hidden`
- Hamburger button gets `class="lg:hidden"` (hidden on ≥1024px)
- Left: page title derived via `toSignal(router.events NavigationEnd → route.title)`
- Right: Notifications + SchemeSwitcher + circular avatar (rounded-full, initials, opens mat-menu)
- Layout wrapper: `flex flex-col h-full`; router outlet wrapped in `<div class="flex-1 min-h-0">`
- New imports: Router, NavigationEnd, startWith, computed, LAYOUT_AUTH_SERVICE, MatMenu, RouterLink, filter, map

## Change 2 — `manage-college.component.html`
- Remove `<h1>Manage College</h1>` and user avatar div
- Remove commented filter chips block
- Add Edit button in list mode (when selectedCollege() truthy)
- Change outer wrapper `h-screen` → `h-full`

## Change 3 — `college-detail-panel.component.{html,ts}`
- Merge sticky sub-header into single `overflow-y-auto` container
- Remove Edit button and `editClicked` output
- Add `host: { class: 'flex-1 min-h-0 flex flex-col' }`

## Change 4 — `manage-company.component.{html,ts}`
- Remove `<h1>Manage Company</h1>` and filter chips section
- Add Edit button (list mode, when selectedCompany() truthy)
- Add Back + Preview buttons for edit/create mode
- Add Back button for preview mode
- Remove `filterChips` constant and `activeChip` signal
- Change outer wrapper `h-screen` → `h-full`

## Change 5 — `company-detail-panel.component.{html,ts}`
- Merge sticky sub-header into single `overflow-y-auto` container
- Remove Edit button and `editClicked` output
- Add `host: { class: 'flex-1 min-h-0 flex flex-col' }`

## Change 6 — Host flex bindings
Add `host: { class: 'flex-1 min-h-0 flex flex-col' }` to:
- `college-form.component.ts`
- `college-preview.component.ts`
- `company-form.component.ts`
- `company-preview.component.ts`
- Both `media-library-panel.component.ts` files
