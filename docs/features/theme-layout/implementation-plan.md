# Theme Layout — Implementation Plan

## Overview
Build a shared `AdminLayoutComponent` shell for the admin-portal that wraps all authenticated routes. Eliminates duplicate header/nav-drawer code from every page. Mirrors fuse-theme's layout pattern, styled with WRCF Design System v3.2 tokens.

---

## Architecture

```
AdminLayoutComponent (MatSidenavContainer shell)
├── MatSidenav (side on desktop, overlay on mobile)
│   └── AdminSidebarComponent
│       ├── Whizard logo + branding
│       ├── NavigationComponent (data-driven tree)
│       └── UserMenuComponent (user info + logout)
└── MatSidenavContent
    ├── Mobile header (hamburger + NotificationsComponent + SchemeSwitcherComponent)
    └── <router-outlet /> ← pages render here
```

---

## Step 1 — Shared layout components in `libs/shared/ui/src/layout/`

### 1.1 `navigation.types.ts`
- `NavigationItem` type: `{ id, label, route?, icon?, badge?, children?, disabled?, expanded?, activeOptions? }`
- `NAVIGATION_ITEMS` injection token: `InjectionToken<NavigationItem[]>`

### 1.2 `navigation.component.ts` — `NavigationComponent`
- Selector: `whizard-navigation`
- Input: `items = input.required<NavigationItem[]>()`
- Data-driven tree using `@angular/aria/tree` (Tree, TreeItem, TreeItemGroup)
- Section groups with uppercase labels (`text.secondary`, `#7F94AE`)
- Nav item height: 48px, px-5, `text.primary` (`#E8F0FA`), 15px
- Active state: bg `bg.selected` (#2D2A5A) + 4px left border `accent` (#00BFFF)
- Hover: bg `bg.card` (#1E293B)
- Icon via `svgIcon` binding (size 4.5), badge support
- Expand/collapse chevron for items with children
- On init: expand parent of active route (port of fuse `expandActiveRoute` logic)

### 1.3 `scheme-switcher.component.ts` — `SchemeSwitcherComponent`
- Selector: `whizard-scheme-switcher`
- Injects `Theming` from `@whizard/theme`
- `MatIconButton` + `MatMenu` with Light / Dark / System options
- `MatPseudoCheckbox` for active indicator
- Icon: `heroicons_outline:sun` or `sun-moon` svg icon

### 1.4 `notifications.component.ts` — `NotificationsComponent`
- Selector: `whizard-notifications`
- Bell icon button + `CdkConnectedOverlay` panel
- Overlay panel: max-h-120, w-xs, bg `bg.card` (#1E293B), border `border` (#484E5D), rounded-lg
- Filter tabs: All / System / Archive (MatButton filled/text toggle)
- Notification list with title, description, time-ago (`date-fns formatDistance`)
- Per-notification ellipsis menu: Mark as read / Delete
- Header ellipsis menu: Mark all as read / Notification settings
- Static mock data for now (no API integration in this feature)

### 1.5 `auth.token.ts`
- `LayoutAuthService` interface: `{ currentUser: Signal<{email, displayName} | null>; signOut(): Promise<void> }`
- `LAYOUT_AUTH_SERVICE = new InjectionToken<LayoutAuthService>('LAYOUT_AUTH_SERVICE')`

### 1.6 `user-menu.component.ts` — `UserMenuComponent`
- Selector: `whizard-user-menu`
- Injects `LAYOUT_AUTH_SERVICE` token
- Shows user avatar (initials fallback, bg `action` #314DDF), display name, email
- `MatMenu` (above, before): Profile link (`/profile`), Appearance submenu (scheme switcher), divider, Sign out
- Sign out calls `authService.signOut()`

### 1.7 `sidebar.component.ts` — `AdminSidebarComponent`
- Selector: `whizard-admin-sidebar`
- Input: `navigationItems = input.required<NavigationItem[]>()`
- Full height flex-col, bg `bg.secondary` (#0F253F), border-r `border` (#484E5D), w-65
- Top: Whizard logo (svg or text) + "Whizard Admin" branding + `<whizard-notifications />`
- Middle: `<whizard-navigation [items]="navigationItems()" />` (flex-auto)
- Bottom: `<whizard-user-menu />` (p-2)

### 1.8 `layout.component.ts` — `AdminLayoutComponent`
- Selector: `whizard-admin-layout`
- Injects `NAVIGATION_ITEMS` token for nav data
- Uses Angular CDK `BreakpointObserver` → `isMobile` signal (`max-width: 1023px`)
- `MatSidenavContainer` (min-h-screen, bg `bg.primary` #0F172A)
- Sidenav: w-65, `mode="over"` on mobile / `mode="side"` on desktop, `fixedInViewport`
- Content area:
  - Mobile header (h-16, `lg:hidden`, border-b `border`, bg `bg.primary`): hamburger toggle + spacer + notifications + scheme-switcher
  - `<router-outlet />`

---

## Step 2 — Navigation data in admin-portal

### `apps/web/admin-portal/src/app/core/navigation.ts`
```
ADMIN_NAVIGATION: NavigationItem[] = [
  Overview: [ Dashboard ]
  WRCF: [ Manage Industry, Manage Skills, Manage Roles ]
  College: [ Manage College ]
  Company: [ Manage Company ]
  Account: [ Profile ]
]
```
Icons reuse existing heroicons_outline set already registered.

---

## Step 3 — Wire up admin-portal

### `app.config.ts`
- Remove duplicate `provideTheming()` call (currently called twice — bug)
- Keep single `provideTheming({ scheme: 'system', primary: '#2563eb', error: '#dc2626' })`
- Add: `{ provide: NAVIGATION_ITEMS, useValue: ADMIN_NAVIGATION }`
- Add: `{ provide: LAYOUT_AUTH_SERVICE, useExisting: StackAuthService }`

### `app.routes.ts`
Wrap all authenticated pages in shell layout (same URLs, no breaking change):
```
{ path: '', component: AdminLayoutComponent, canActivate: [authGuard], children: [
    { path: 'dashboard', component: WrcfDashboardComponent },
    { path: 'profile', component: EnhancedProfilePageComponent },
    { path: 'industry-wrcf', component: IndustryWrcfComponent },
    { path: 'wrcf-skills', component: WrcfSkillsComponent },
    { path: 'wrcf-roles', component: WrcfRolesComponent },
    { path: 'manage-college', component: ManageCollegeComponent },
    { path: 'manage-company', component: ManageCompanyComponent },
]}
{ path: 'login', component: LoginPageComponent }
{ path: 'signup', component: SignupPageComponent }
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
```

---

## Step 4 — Remove duplicate headers from all page components

For each of the 7 authenticated pages, remove:
- `<whizard-nav-drawer [open]="drawerOpen()" (closed)="drawerOpen.set(false)" />`
- The `<header>` block (hamburger + title + user avatar)
- `drawerOpen` signal from component class
- `NavDrawerComponent` import

Pages to update:
1. `wrcf-dashboard.component.{html,ts}`
2. `industry-wrcf.component.{html,ts}`
3. `wrcf-skills.component.{html,ts}`
4. `wrcf-roles.component.{html,ts}`
5. `manage-college.component.{html,ts}`
6. `manage-company.component.{html,ts}`
7. `enhanced-profile-page.component.{html,ts}`

---

## Step 5 — Export from shared UI

### `libs/shared/ui/src/index.ts`
Add exports:
```typescript
export { AdminLayoutComponent } from './layout/layout.component.js';
export { AdminSidebarComponent } from './layout/sidebar.component.js';
export { NavigationComponent } from './layout/navigation.component.js';
export { SchemeSwitcherComponent } from './layout/scheme-switcher.component.js';
export { NotificationsComponent } from './layout/notifications.component.js';
export { UserMenuComponent } from './layout/user-menu.component.js';
export type { NavigationItem } from './layout/navigation.types.js';
export { NAVIGATION_ITEMS, LAYOUT_AUTH_SERVICE } from './layout/navigation.types.js';
```

---

## Files Summary

### Create
| File | Description |
|---|---|
| `libs/shared/ui/src/layout/navigation.types.ts` | Types + injection tokens |
| `libs/shared/ui/src/layout/navigation.component.ts` | Tree navigation |
| `libs/shared/ui/src/layout/scheme-switcher.component.ts` | Theme switcher |
| `libs/shared/ui/src/layout/notifications.component.ts` | Notification panel |
| `libs/shared/ui/src/layout/auth.token.ts` | Auth service token |
| `libs/shared/ui/src/layout/user-menu.component.ts` | User card + logout |
| `libs/shared/ui/src/layout/sidebar.component.ts` | Sidebar shell |
| `libs/shared/ui/src/layout/layout.component.ts` | Main layout shell |
| `apps/web/admin-portal/src/app/core/navigation.ts` | Nav item data |

### Modify
| File | Change |
|---|---|
| `libs/shared/ui/src/index.ts` | Export layout components |
| `apps/web/admin-portal/src/app/app.config.ts` | Fix duplicate theming, provide tokens |
| `apps/web/admin-portal/src/app/app.routes.ts` | Add shell layout wrapper |
| 7 × page `{html,ts}` files | Remove duplicate header + nav-drawer |

### No changes needed
- Backend, DB, API — purely frontend
- Login / Signup pages — stay outside the shell

---

## Design Token Reference (WRCF v3.2)

| Token | Value | Usage in layout |
|---|---|---|
| `bg.primary` | `#0F172A` | Page bg, mobile header bg |
| `bg.secondary` | `#0F253F` | Sidebar bg |
| `bg.card` | `#1E293B` | Nav item hover |
| `bg.selected` | `#2D2A5A` | Active nav item bg |
| `text.primary` | `#E8F0FA` | Nav labels, user name |
| `text.secondary` | `#7F94AE` | Section group labels |
| `border` | `#484E5D` | Sidebar border-r, mobile header border-b |
| `action` | `#314DDF` | User avatar bg |
| `accent` | `#00BFFF` | Active nav item left border (4px) |
