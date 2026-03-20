# WRCF: Manage Industry Page + ImpactLevel Config-Resolved Values

**Date:** 19–20 Mar 2026
**Areas:** `capability-framework` bounded context, Core API, BFF, Admin Portal

---

## Overview

Two related deliverables shipped together:

1. **Manage Industry WRCF page** — a new full-stack feature exposing the Workforce Role Capability Framework hierarchy (Sector → Industry → FG → PWO → SWO → Capability/Proficiency) through a cascade-column UI in the admin portal, backed by a new `capability-framework` DDD bounded context and REST API layer.

2. **ImpactLevel label-storage + config-resolved numeric values** — a follow-up design change (PM decision, Yogesh, 20 Mar 2026) replacing the simple string enum stored in the DB with a structured `{ label, value }` approach where labels are stored and numeric weights are resolved at runtime from per-category config constants.

---

## Part 1: Manage Industry WRCF Page

### Database Schema (`prisma/schema.prisma`)

Six new tables added to the existing PostgreSQL schema (no separate migration file needed beyond `pnpm prisma:migrate:dev`):

| Table | Description |
|---|---|
| `industry_sectors` | Reference: top-level sectors (e.g. Manufacturing) |
| `industries` | Reference: industries within a sector |
| `functional_groups` | Tenant-scoped; belongs to an industry; has `domainType` |
| `primary_work_objects` | Tenant-scoped; belongs to a FG; has `strategicImportance`, `revenueImpact`, `downtimeSensitivity` |
| `secondary_work_objects` | Tenant-scoped; belongs to a PWO; has `operationalComplexity`, `assetCriticality`, `failureFrequency` |
| `capability_instances` | Junction: (tenant, FG, PWO, SWO, Capability, Proficiency) |

Impact-level fields (`revenueImpact`, `downtimeSensitivity`, `operationalComplexity`, `assetCriticality`, `failureFrequency`) are stored as `String` — just the label. Seed data is in `prisma/seeds/wrcf-reference.seed.ts`.

---

### Bounded Context: `libs/contexts/capability-framework`

Full DDD layered structure following the project's established pattern.

#### Domain Layer (`src/domain/`)

**Value Objects**
- `impact-level.vo.ts` — `ImpactLevelValue { label, value }` + per-category config constants + `resolveImpactLevel()`
- `strategic-importance.vo.ts` — numeric 1–5 scale
- `domain-type.vo.ts` — `'Operations' | 'Maintenance' | 'Quality'`
- `capability-type.vo.ts`

**Aggregates**
- `FunctionalGroup` — create / update / deactivate; emits `FGCreated`, `FGUpdated`, `FGDeactivated`
- `PrimaryWorkObject` — create / update / deactivate; props include `revenueImpact: ImpactLevelValue`, `downtimeSensitivity: ImpactLevelValue`, `strategicImportance: StrategicImportance`
- `SecondaryWorkObject` — create / update / deactivate; props include `operationalComplexity`, `assetCriticality`, `failureFrequency` (all `ImpactLevelValue`)
- `CapabilityInstance` — junction aggregate

**Entities**
- `Capability`, `Proficiency`

**Repository Interfaces**
- `IFunctionalGroupRepository`, `IPwoRepository`, `ISwoRepository`, `ICapabilityRepository`, `IProficiencyRepository`, `ICapabilityInstanceRepository`, `IIndustrySectorRepository`, `IIndustryRepository`

#### Application Layer (`src/application/`)

**Commands + Handlers**

| Command | Handler | What it does |
|---|---|---|
| `CreateFGCommand` | `CreateFGCommandHandler` | Creates a FG under an industry |
| `UpdateFGCommand` | `UpdateFGCommandHandler` | Updates name / description / domainType; throws `DomainException` if not found |
| `DeactivateFGCommand` | `DeactivateFGCommandHandler` | Soft-deletes; blocks if PWOs exist |
| `CreatePWOCommand` | `CreatePWOCommandHandler` | Creates a PWO under a FG |
| `UpdatePWOCommand` | `UpdatePWOCommandHandler` | Updates PWO fields |
| `DeactivatePWOCommand` | `DeactivatePWOCommandHandler` | Soft-deletes; blocks if SWOs exist |
| `CreateSWOCommand` | `CreateSWOCommandHandler` | Creates a SWO under a PWO |
| `UpdateSWOCommand` | `UpdateSWOCommandHandler` | Updates SWO fields |
| `DeactivateSWOCommand` | `DeactivateSWOCommandHandler` | Soft-deletes SWO |

**Query Handlers**

`ListSectorsQueryHandler`, `ListIndustriesQueryHandler`, `ListFGsQueryHandler`, `ListPWOsQueryHandler`, `ListSWOsQueryHandler`, `ListCapabilitiesQueryHandler`, `ListProficienciesQueryHandler`

**DTOs**

All query handlers return typed DTOs (`FgDto`, `PwoDto`, `SwoDto`, etc.). `PwoDto` and `SwoDto` return `ImpactLevelValue` objects (not raw strings) so consumers see both the label and current numeric weight.

**`DomainException`** — thrown by handlers for 404/409 cases; caught in route layer to return 404/409 HTTP responses.

#### Infrastructure Layer (`src/infrastructure/persistence/postgres/repositories/`)

Eight Prisma repository implementations. Key pattern for impact-level fields:

- **Write (`save`)**: persist only `.label` string — e.g. `revenueImpact: pwo.revenueImpact.label`
- **Read (`findById`, `findByFG`, `findByPWO`)**: call `resolveImpactLevel(row.field, CONFIG)` to reconstruct `ImpactLevelValue` at runtime

```ts
// read
revenueImpact: resolveImpactLevel(row.revenueImpact, CRITICALITY_LEVELS),

// write
revenueImpact: pwo.revenueImpact.label,
```

---

### Core API (`apps/api/core-api/src/modules/wrcf/`)

| File | Role |
|---|---|
| `routes.ts` | Fastify route handlers for all 16 WRCF endpoints |
| `wrcf.module.ts` | Registers routes under `/api/wrcf` prefix |
| `runtime.ts` | Wires repositories → command/query handlers → registers module |

**Route → Command mapping** (POST/PATCH parse body and call handlers; GET call query handlers):

```
GET  /sectors                              → listSectors
GET  /sectors/:sectorId/industries         → listIndustries
GET  /industries/:industryId/functional-groups → listFGs
POST /functional-groups                    → createFG
PATCH /functional-groups/:id               → updateFG  (404 on DomainException)
DELETE /functional-groups/:id              → deactivateFG  (409 if PWOs exist)
GET  /functional-groups/:fgId/pwos         → listPWOs
POST /pwos                                 → createPWO
PATCH /pwos/:id                            → updatePWO  (404 on DomainException)
DELETE /pwos/:id                           → deactivatePWO  (409 if SWOs exist)
GET  /pwos/:pwoId/swos                     → listSWOs
POST /swos                                 → createSWO
PATCH /swos/:id                            → updateSWO  (404 on DomainException)
DELETE /swos/:id                           → deactivateSWO
GET  /capabilities                         → listCapabilities
GET  /proficiencies                        → listProficiencies
```

Impact-level fields: routes accept the **label string** from the client body and call `resolveImpactLevel(label, CONFIG)` before passing to the command. Unknown labels throw → 500 (acts as input validation).

---

### BFF (`apps/api/bff/src/modules/wrcf/`)

Thin proxy: `registerWrcfBffRoutes` maps all 16 WRCF routes under `/wrcf` to the corresponding Core API paths via `forwardToCore()`. Passes tenant headers (`X-Actor-User-Account-Id`, `X-Tenant-Type`, `X-Tenant-Id`) from the incoming request.

---

### Admin Portal (`apps/web/admin-portal/src/app/pages/industry-wrcf/`)

#### Page: `IndustryWrcfComponent`

Cascade-selection layout:

```
[Sector Dropdown] [Industry Dropdown]
[FG Column] → [PWO Column] → [SWO Column] → [Capability Column] → [Proficiency Column]
```

Selecting an item in a column loads the next column's data. Each column has a ＋ button (create) and items are clickable to edit. State is managed with Angular signals.

#### `WrcfColumnComponent`

Reusable column: takes `title`, `items: WrcfEntity[]`, `selectedId`, emits `selectItem` and `create`. Renders items with selection highlight and badge counts.

#### `WrcfPanelComponent`

Side panel for create/edit. Shows fields appropriate to the entity type (`FG` / `PWO` / `SWO`). Uses `FormsModule` with `[(ngModel)]` bindings. Emits `save`, `delete`, `close` events.

#### `WrcfApiService`

HTTP client service that calls the BFF. For impact-level fields, it accepts `ImpactLevelValue` objects but sends only `.label` in the HTTP body:

```ts
createPWO(data: { ..., revenueImpact: ImpactLevelValue; ... }) {
  return this.http.post(`${this.base}/pwos`, {
    ...data,
    revenueImpact: data.revenueImpact.label,   // only the label goes over the wire
  });
}
```

---

## Part 2: ImpactLevel — Label Storage + Config-Resolved Numeric Values

### Motivation

Storing numeric weights in the DB causes stale data when PM changes a weight: all existing rows carry the old value and require a data migration. Storing only the human label and resolving the numeric weight from a config constant at runtime means any weight change applies immediately to all records, with no migration.

### Design

```
DB column    →  stores: "Low" / "Medium" / "High"   (label only)
resolveImpactLevel(label, config)  →  { label: "Medium", value: 0.6 }
```

### Config Constants (per category)

```
CRITICALITY_LEVELS  (assetCriticality, revenueImpact, downtimeSensitivity, failureFrequency)
  Low    → 0.3
  Medium → 0.6
  High   → 0.8

COMPLEXITY_LEVELS   (operationalComplexity)
  Low    → 0.3
  Medium → 0.6
  High   → 0.9
```

`FREQUENCY_LEVELS` is an alias of `CRITICALITY_LEVELS`.

`resolveImpactLevel` does a **case-insensitive** label match so legacy DB rows with uppercase labels (`"LOW"`, `"MEDIUM"`, `"HIGH"`) continue to resolve correctly without a migration.

### Files Changed

| File | Change |
|---|---|
| `libs/contexts/capability-framework/src/domain/value-objects/impact-level.vo.ts` | Replaced `ImpactLevel` string union with `ImpactLevelValue` interface, config constants, and `resolveImpactLevel()` |
| `domain/aggregates/primary-work-object.aggregate.ts` | Props use `ImpactLevelValue` instead of `ImpactLevel` |
| `domain/aggregates/secondary-work-object.aggregate.ts` | Same |
| `application/commands/pwo.commands.ts` | Same |
| `application/commands/swo.commands.ts` | Same |
| `application/dto/pwo.dto.ts` | Same |
| `application/dto/swo.dto.ts` | Same |
| `infrastructure/…/prisma-pwo.repository.ts` | Write: `.label`; Read: `resolveImpactLevel` |
| `infrastructure/…/prisma-swo.repository.ts` | Same |
| `apps/api/core-api/src/modules/wrcf/routes.ts` | Parse label from body; resolve via `resolveImpactLevel` |
| `apps/web/admin-portal/…/models/wrcf.models.ts` | Remove `ImpactLevel` string union; add `ImpactLevelValue` interface; update PWO/SWO model interfaces |
| `apps/web/admin-portal/…/models/wrcf-impact-levels.ts` | **New** — frontend mirror of config constants (`ImpactLevelOption`, `CRITICALITY_LEVELS`, `COMPLEXITY_LEVELS`, `FREQUENCY_LEVELS`) |
| `apps/web/admin-portal/…/wrcf-panel.component.ts` | Per-field dropdown arrays; form fields typed as `ImpactLevelOption`; `populateForm` finds option by label |
| `apps/web/admin-portal/…/wrcf-panel.component.html` | `[ngValue]="opt"` + `{{ opt.label }}` for impact dropdowns |
| `apps/web/admin-portal/…/industry-wrcf.component.ts` | Defaults from constants (e.g. `CRITICALITY_LEVELS[1]` instead of `'MEDIUM'`) |
| `apps/web/admin-portal/…/wrcf-api.service.ts` | Accept `ImpactLevelValue`; send `.label` in HTTP body |
| `apps/web/admin-portal/…/wrcf-mock.service.ts` | Mock data updated to `ImpactLevelOption` objects from constants |

### How to Update a Weight (Future)

1. Edit one line in `impact-level.vo.ts` (server)
2. Edit one line in `wrcf-impact-levels.ts` (frontend display)
3. All existing DB records resolve to the new value on next read — no migration needed
