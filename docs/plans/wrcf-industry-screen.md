# Plan: WRCF Industry Screen — Frontend to Backend

## Overview

The WRCF (Work & Resource Capability Framework) Industry Screen is a full-stack admin feature that lets a tenant configure a hierarchical capability framework per industry. Users select an industry sector and industry, then create and manage the cascade of Functional Groups → Primary Work Objects → Secondary Work Objects, each with metadata and impact-level ratings.

---

## Hierarchy

```
IndustrySector  (shared reference, read-only)
  └── Industry  (shared reference, read-only)
        └── FunctionalGroup  (tenant-scoped, CRUD)
              └── PrimaryWorkObject  (tenant-scoped, CRUD)
                    └── SecondaryWorkObject  (tenant-scoped, CRUD)
                          └── CapabilityInstance  (tenant-scoped, future)
```

Reference data (Sectors, Industries, Capabilities, Proficiencies) is seeded and read-only. Tenant-specific data (FG, PWO, SWO) is created and managed per tenant.

---

## Layer 1 — Database (`prisma/schema.prisma`)

Eight tables created in migration `20260320000000_add_wrcf_schema`:

| Table | Tenant-scoped | Purpose |
|---|---|---|
| `industry_sectors` | No | Reference: sector names |
| `industries` | No | Reference: industry per sector |
| `functional_groups` | Yes | Tenant work domains per industry |
| `primary_work_objects` | Yes | Primary asset/process types per FG |
| `secondary_work_objects` | Yes | Sub-tasks per PWO |
| `capabilities` | No | Reference: skill/competency types |
| `proficiencies` | No | Reference: proficiency levels L1–L5 |
| `capability_instances` | Yes | Junction: FG+PWO+SWO+Cap+Prof per tenant |

**Impact level fields** (`revenueImpact`, `downtimeSensitivity`, `operationalComplexity`, `assetCriticality`, `failureFrequency`) are stored as `String` labels (`"Low"` / `"Medium"` / `"High"`). Numeric weights are resolved at runtime from config constants — not persisted.

**Soft deletes**: All mutable tables have `isActive Boolean DEFAULT true`. Delete = set `isActive = false`; queries always filter `WHERE isActive = true`.

---

## Layer 2 — Domain (`libs/contexts/capability-framework/src/domain/`)

### Value Objects

**`impact-level.vo.ts`**

```ts
interface ImpactLevelValue { label: string; value: number; }

CRITICALITY_LEVELS = [Low:0.3, Medium:0.6, High:0.8]  // revenueImpact, downtimeSensitivity, assetCriticality, failureFrequency
COMPLEXITY_LEVELS  = [Low:0.3, Medium:0.6, High:0.9]  // operationalComplexity

resolveImpactLevel(label, config)  // case-insensitive lookup; throws on unknown label
```

**`domain-type.vo.ts`** — `'Operations' | 'Maintenance' | 'Quality'`

**`strategic-importance.vo.ts`** — `1 | 2 | 3 | 4 | 5`

### Aggregates

Each aggregate:
- Has a `static create()` factory that emits a domain event
- Has a `static reconstitute()` that rehydrates from persistence without emitting events
- Has an `update()` method for partial field changes
- Has a `deactivate()` method for soft delete
- Tracks domain events in `_domainEvents`

**FunctionalGroup**: `{ id, tenantId, industryId, name, description?, domainType, isActive, versionId? }`

**PrimaryWorkObject**: `{ id, tenantId, functionalGroupId, name, description?, strategicImportance: 1–5, revenueImpact: ImpactLevelValue, downtimeSensitivity: ImpactLevelValue, isActive }`

**SecondaryWorkObject**: `{ id, tenantId, pwoId, name, description?, operationalComplexity: ImpactLevelValue, assetCriticality: ImpactLevelValue, failureFrequency: ImpactLevelValue, isActive }`

### Repository Interfaces

```
IFunctionalGroupRepository:  findById(), findByIndustry(industryId, tenantId), save()
IPwoRepository:              findById(), findByFG(fgId, tenantId), save()
ISwoRepository:              findById(), findByPWO(pwoId, tenantId), save()
ICapabilityRepository:       findAll(), findById()
IProficiencyRepository:      findAll(), findById()
IIndustrySectorRepository:   findAll(), findById()
IIndustryRepository:         findAll(), findById(), findBySector(sectorId)
```

---

## Layer 3 — Application (`libs/contexts/capability-framework/src/application/`)

### Commands

```
CreateFGCommand        { industryId, tenantId, name, description?, domainType }
UpdateFGCommand        { id, tenantId, name?, description?, domainType? }
DeactivateFGCommand    { id, tenantId }

CreatePWOCommand       { functionalGroupId, tenantId, name, description?, strategicImportance, revenueImpact, downtimeSensitivity }
UpdatePWOCommand       { id, tenantId, name?, description?, strategicImportance?, revenueImpact?, downtimeSensitivity? }
DeactivatePWOCommand   { id, tenantId }

CreateSWOCommand       { pwoId, tenantId, name, description?, operationalComplexity, assetCriticality, failureFrequency }
UpdateSWOCommand       { id, tenantId, name?, description?, operationalComplexity?, assetCriticality?, failureFrequency? }
DeactivateSWOCommand   { id, tenantId }
```

Impact level fields in commands carry the resolved `ImpactLevelValue { label, value }` — the route layer resolves label → VO before constructing the command.

### DTOs (returned by query handlers)

```
FunctionalGroupDto: { id, tenantId, industryId, name, description?, domainType, isActive }
PwoDto:             { id, tenantId, functionalGroupId, name, description?, strategicImportance, revenueImpact: ImpactLevelValue, downtimeSensitivity: ImpactLevelValue, isActive }
SwoDto:             { id, tenantId, pwoId, name, description?, operationalComplexity: ImpactLevelValue, assetCriticality: ImpactLevelValue, failureFrequency: ImpactLevelValue, isActive }
IndustrySectorDto:  { id, name }
IndustryDto:        { id, sectorId, name }
CapabilityDto:      { id, code, name }
ProficiencyDto:     { id, level, label, description?, independenceLevel? }
```

### Query Handlers

| Handler | Query param | Repository call |
|---|---|---|
| `ListSectorsQueryHandler` | — | `findAll()` |
| `ListIndustriesQueryHandler` | `sectorId` | `findBySector()` |
| `ListFGsQueryHandler` | `industryId`, `tenantId` | `findByIndustry()` |
| `ListPWOsQueryHandler` | `fgId`, `tenantId` | `findByFG()` |
| `ListSWOsQueryHandler` | `pwoId`, `tenantId` | `findByPWO()` |
| `ListCapabilitiesQueryHandler` | — | `findAll()` |
| `ListProficienciesQueryHandler` | — | `findAll()` |

---

## Layer 4 — Infrastructure (`libs/contexts/capability-framework/src/infrastructure/`)

Prisma repository implementations handle the label ↔ `ImpactLevelValue` translation at the boundary:

**Write path**: persist only the label string
```ts
revenueImpact: pwo.revenueImpact.label,   // "Low" / "Medium" / "High"
```

**Read path**: resolve numeric weight from config constant
```ts
revenueImpact: resolveImpactLevel(row.revenueImpact, CRITICALITY_LEVELS),
// resolveImpactLevel is case-insensitive to handle legacy uppercase values
```

Per-field config mapping:
- `revenueImpact` → `CRITICALITY_LEVELS`
- `downtimeSensitivity` → `CRITICALITY_LEVELS`
- `operationalComplexity` → `COMPLEXITY_LEVELS`
- `assetCriticality` → `CRITICALITY_LEVELS`
- `failureFrequency` → `FREQUENCY_LEVELS` (= CRITICALITY_LEVELS)

---

## Layer 5 — Core API (`apps/api/core-api/src/modules/wrcf/`)

### Dependency Injection (`runtime.ts`)

Instantiates all Prisma repositories and wires them into command handlers and query handlers. Returns a `deps` object passed to route handlers.

### Routes (`routes.ts`, prefix `/api/wrcf`)

All routes extract `tenantId` and `userId` from request headers (`X-Tenant-Id`, `X-Actor-User-Account-Id`).

**Impact level parsing** — routes resolve the string label from the request body to `ImpactLevelValue` before passing to commands:
```ts
revenueImpact: resolveImpactLevel(String(body['revenueImpact']), CRITICALITY_LEVELS),
```
An unknown label throws, which returns a 500 (acts as input validation).

**Route table**:

| Method | Path | Handler |
|---|---|---|
| GET | `/sectors` | `listSectorsHandler` |
| GET | `/sectors/:sectorId/industries` | `listIndustriesHandler` |
| GET | `/industries/:industryId/functional-groups` | `listFGsHandler` |
| POST | `/functional-groups` | `createFGHandler` |
| PATCH | `/functional-groups/:id` | `updateFGHandler` |
| DELETE | `/functional-groups/:id` | `deactivateFGHandler` |
| GET | `/functional-groups/:fgId/pwos` | `listPWOsHandler` |
| POST | `/pwos` | `createPWOHandler` |
| PATCH | `/pwos/:id` | `updatePWOHandler` |
| DELETE | `/pwos/:id` | `deactivatePWOHandler` |
| GET | `/pwos/:pwoId/swos` | `listSWOsHandler` |
| POST | `/swos` | `createSWOHandler` |
| PATCH | `/swos/:id` | `updateSWOHandler` |
| DELETE | `/swos/:id` | `deactivateSWOHandler` |
| GET | `/capabilities` | `listCapabilitiesHandler` |
| GET | `/proficiencies` | `listProficienciesHandler` |

---

## Layer 6 — BFF (`apps/api/bff/src/modules/wrcf/`)

Pure proxy layer. Each route forwards to the Core API equivalent, passing through:
- `X-Actor-User-Account-Id`
- `X-Tenant-Type`
- `X-Tenant-Id`
- `Content-Type: application/json` — only for POST/PATCH/PUT (not GET/DELETE, to avoid `FST_ERR_CTP_EMPTY_JSON_BODY`)

**Route prefix**: `/wrcf`
**BFF → Core API path prefix**: `/api/wrcf`

---

## Layer 7 — Frontend (`apps/web/admin-portal/src/app/pages/industry-wrcf/`)

### API Service (`services/wrcf-api.service.ts`)

Base URL: `${environment.bffApiUrl}/wrcf`

- All query methods: `GET`, returns `{ success, data: T[] }`
- All mutation methods: `POST` / `PATCH` / `DELETE`
- Impact level fields: sends only the label string to the API (`value.label`), receives full `ImpactLevelValue` objects back from GET responses

### Models (`models/wrcf.models.ts`)

```ts
interface ImpactLevelValue { label: string; value: number; }
interface WrcfEntity       { id, name, description?, code? }
interface FunctionalGroup  { id, name, description?, domainType }
interface PrimaryWorkObject  { id, name, description?, strategicImportance, revenueImpact: ImpactLevelValue, downtimeSensitivity: ImpactLevelValue }
interface SecondaryWorkObject { id, name, description?, operationalComplexity: ImpactLevelValue, assetCriticality: ImpactLevelValue, failureFrequency: ImpactLevelValue }

type EntityType = 'FG' | 'PWO' | 'SWO'
type PanelState = { open: boolean, mode: 'create' | 'edit', entityType: EntityType, data?: any }
```

### Impact Level Constants (`models/wrcf-impact-levels.ts`)

Frontend mirror of the server-side config:
```ts
CRITICALITY_LEVELS = [{ label:'Low', value:0.3 }, { label:'Medium', value:0.6 }, { label:'High', value:0.8 }]
COMPLEXITY_LEVELS  = [{ label:'Low', value:0.3 }, { label:'Medium', value:0.6 }, { label:'High', value:0.9 }]
FREQUENCY_LEVELS   = CRITICALITY_LEVELS
```

If PM changes a weight, edit both the server VO file and this file — no DB migration needed.

### Main Page (`industry-wrcf.component.ts`)

Uses Angular 19 signals for all state. No RxJS subscriptions.

**Initialization**: loads sectors + capabilities + proficiencies on init.

**Selection cascade**: selecting a sector → loads industries; selecting an industry → loads FGs; selecting an FG → loads PWOs; selecting a PWO → loads SWOs. Each level clears dependent selections.

**Panel lifecycle**:
1. User clicks `+` or edit icon on a column → `openPanel(mode, entityType, data?)`
2. Panel emits `save` → `onPanelSave(payload)` → routes to `handleCreate()` or `handleUpdate()`
3. Panel emits `delete` → `onPanelDelete(id)` → calls `deleteFG/PWO/SWO`, then refreshes parent list
4. After any mutation, the affected list is reloaded and selection is preserved or reset

**Default values when creating**:
- FG: `domainType = 'Operations'`
- PWO: `strategicImportance = 3`, `revenueImpact = CRITICALITY_LEVELS[1]` (Medium), `downtimeSensitivity = CRITICALITY_LEVELS[1]`
- SWO: `operationalComplexity = COMPLEXITY_LEVELS[1]`, `assetCriticality = CRITICALITY_LEVELS[1]`, `failureFrequency = FREQUENCY_LEVELS[0]`

### Column Component (`components/wrcf-column/`)

Reusable list display. Inputs: `title`, `items`, `selectedId`, `readonly`, `showAdd`. Outputs: `itemSelected`, `addClicked`, `editClicked`.

### Panel Component (`components/wrcf-panel/`)

Slide-in form (560px, fixed right). Dynamically renders fields based on `state.entityType`:

| Entity | Fields |
|---|---|
| FG | Name, Description, Domain Type (dropdown: Operations / Maintenance / Quality) |
| PWO | Name, Description, Strategic Importance (1–5), Revenue Impact, Downtime Sensitivity |
| SWO | Name, Description, Operational Complexity, Asset Criticality, Failure Frequency |

Impact dropdowns use per-field constant arrays with `[ngValue]="opt"` binding. The full `ImpactLevelOption` object is the form control value; the service strips it to `.label` before the HTTP call.

---

## Seed Data

Run via `prisma/seeds/wrcf-reference.seed.ts` (compiled to `.cjs` in Docker). Uses idempotent upserts (`ON CONFLICT DO NOTHING` equivalent):

- **Sectors**: Manufacturing, Energy & Utilities
- **Industries**: Thermal Power Plant, Steel Manufacturing, Wind Energy
- **Capabilities (7)**: Fundamental Principles, System Understanding, Operational Execution, Routine Maintenance, Fault Diagnosis, Root Cause Analysis, First Response Resolution
- **Proficiencies (5)**: L1 Plant Awareness → L5 Full Independence

---

## Design System

All WRCF pages use **Poppins** font exclusively and the following color tokens:

| Token | Hex | Usage |
|---|---|---|
| `bg.primary` | `#0F172A` | Page background, header |
| `bg.secondary` | `#0F253F` | Filter bar, dropdowns |
| `bg.card` | `#1E293B` | Columns, panels |
| `bg.selected` | `#2D2A5A` | Selected item background |
| `text.primary` | `#E8F0FA` | Body text, titles |
| `text.secondary` | `#7F94AE` | Labels, muted |
| `text.tertiary` | `#8AB4F8` | Codes, helpers |
| `border` | `#484E5D` | All borders |
| `action` | `#314DDF` | Primary buttons, column headers |
| `action.hover` | `#263FCC` | Hover state |
| `accent` | `#00BFFF` | Secondary buttons, selected border |

**Selection columns**: 260px wide, `bg.card`, selected item has 4px left border in `accent`.
**Panel**: 560px wide, fixed right, slides over content.
**Buttons**: height 40px, border-radius 10px.

---

## Key Design Decisions

### Label in DB, numeric weight from config

Impact level fields store the label string (`"Low"` / `"Medium"` / `"High"`) in DB columns, not the numeric weight. The weight is resolved at read time from a config constant.

**Why**: if the PM changes Medium from 0.6 → 0.5, all historical records instantly reflect the new value with no data migration. Storing the number would require a migration AND create historical inconsistency.

**To change a weight**: edit one line in `impact-level.vo.ts` and one line in `wrcf-impact-levels.ts`. Zero DB changes.

### Soft deletes throughout

No hard deletes. `isActive = false` is the delete path. Keeps audit history and prevents foreign key cascade issues.

### BFF as pure proxy

The BFF does not contain any WRCF business logic — it only forwards requests, injects tenant headers, and conditionally adds `Content-Type: application/json` (only for body-carrying methods to avoid `FST_ERR_CTP_EMPTY_JSON_BODY` on GET/DELETE).

### Signal-based state in Angular 19

No RxJS in the page component. Angular signals provide fine-grained reactivity without subscription management.
