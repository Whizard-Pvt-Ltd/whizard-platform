# WRCF Dashboard — Implementation Plan

## Overview
A read-only dashboard showing counts of all WRCF entities for a selected Industry Sector + Industry, with a static version row and quick-action navigation buttons.

## 1. Data Model — No schema changes
No new tables. The dashboard is purely aggregate counts over existing tables.

**Response shape (new DTO):**
```typescript
interface WrcfDashboardStatsDto {
  functionalGroups: number;
  primaryWorkObjects: number;
  secondaryWorkObjects: number;
  capabilityInstances: number;
  skills: number;
  tasks: number;
  departments: number;
  roles: number;
}
```

## 2. Domain Layer — New repository interface
**File to create:** `libs/contexts/capability-framework/src/domain/repositories/wrcf-dashboard.repository.ts`

## 3. Application Layer — New query handler
**File to create:** `libs/contexts/capability-framework/src/application/query-handlers/get-dashboard-stats.handler.ts`
- `GetDashboardStatsQueryHandler` takes `(tenantId, industryId, actorUserId?)`

## 4. Infrastructure Layer — Prisma implementation
**File to create:** `libs/contexts/capability-framework/src/infrastructure/persistence/postgres/repositories/prisma-wrcf-dashboard.repository.ts`
- Runs 8 parallel `Promise.all` count queries
- FGs, PWOs (via FG), SWOs (via PWO→FG), CIs, Skills (via CI→FG), Tasks (via Skill→CI→FG), Departments, Roles (via Dept)

## 5. Core API — New route
`GET /industries/:industryId/dashboard-stats` (auth: WRCF.MANAGE)

**Files to modify:** `routes.ts`, `runtime.ts`

## 6. BFF — New proxy route
`GET /industries/:industryId/dashboard-stats` → forwards to Core API

## 7. Frontend — Angular Dashboard page
```
apps/web/admin-portal/src/app/pages/wrcf-dashboard/
  wrcf-dashboard.component.ts/html/css
  services/wrcf-dashboard-api.service.ts
  models/wrcf-dashboard.models.ts
  components/version-history-dialog/
  components/publish-draft-dialog/
```

- Auto-select first sector/industry on load
- Zero-state: show 0 for all counts
- Version row: static hardcoded
- Quick Actions: Edit Structure → /industry-wrcf, Manage Roles → /wrcf-roles, dialogs for Version History & Publish Draft

## 8. Files Summary

| Action | File |
|---|---|
| Create | `libs/contexts/capability-framework/src/domain/repositories/wrcf-dashboard.repository.ts` |
| Create | `libs/contexts/capability-framework/src/application/query-handlers/get-dashboard-stats.handler.ts` |
| Create | `libs/contexts/capability-framework/src/infrastructure/persistence/postgres/repositories/prisma-wrcf-dashboard.repository.ts` |
| Modify | `libs/contexts/capability-framework/src/index.ts` |
| Modify | `apps/api/core-api/src/modules/wrcf/routes.ts` |
| Modify | `apps/api/core-api/src/modules/wrcf/runtime.ts` |
| Modify | `apps/api/bff/src/modules/wrcf/routes.ts` |
| Create | `apps/web/admin-portal/src/app/pages/wrcf-dashboard/` (all component files) |
| Modify | `apps/web/admin-portal/src/app/app.routes.ts` |
| Modify | navigation component |
