# DB Refactoring Plan: BigInt PKs + Public UUID

## Overview

Refactor all database tables so every table has exactly two identifier columns:

1. `id` — `BIGSERIAL` primary key, used as FK in all relations including `createdBy` / `updatedBy`
2. `public_uuid` — UUID, exposed externally via APIs, never used as FK

---

## Core Architectural Decision

**Expose `publicUuid` externally, use `id` (BigInt) internally.**

- API routes and frontend continue to use UUID strings (no breaking changes there)
- DB internals use BigInt for fast joins and indexes
- The Prisma infrastructure repository layer is the sole translation point
- Domain, application, API, and frontend layers are unaffected

```
Frontend (string UUID)
    ↓
BFF → Core API routes (string UUID via :id param)
    ↓
Application handlers (string UUID via commands/queries)
    ↓
Repository interface (string UUID)
    ↓
Prisma repo [TRANSLATION LAYER] — findUnique({ where: { publicUuid: id } })
    ↓
PostgreSQL (BigInt id + public_uuid column)
```

---

## Layer-by-Layer Changes

### 1. Prisma Schema (`prisma/schema.prisma`)

**Pattern applied to every model:**

```prisma
model SomeModel {
  id         BigInt   @id @default(autoincrement())
  publicUuid String   @unique @default(uuid()) @map("public_uuid")
  // ... other fields
  someRelId  BigInt   @map("some_rel_id")          // FK → BigInt
  createdBy  BigInt?  @map("created_by")            // BigInt
  updatedBy  BigInt?  @map("updated_by")            // BigInt
}
```

**Specific changes per model type:**

| Model type | Change |
|---|---|
| All entity models | Add `id BigInt @id @default(autoincrement())`, rename UUID field to `publicUuid` |
| All FK fields | `String` → `BigInt` (e.g., `tenantId`, `industryId`, `collegeId`) |
| `createdBy` / `updatedBy` | `String` / `String?` → `BigInt` / `BigInt?` |
| Composite PK join tables | Add `id` + `publicUuid`; `@@id([a,b])` → `@@unique([a,b])` |

**Affected models (all 38 models):**
`UserAccount`, `Tenant`, `IndustrySector`, `Industry`, `FunctionalGroup`, `PrimaryWorkObject`, `SecondaryWorkObject`, `Capability`, `Proficiency`, `CapabilityInstance`, `Skill`, `Task`, `ControlPoint`, `LearnerEvidence`, `Department`, `DepartmentFunctionalGroup`, `Role`, `RoleCapabilityInstance`, `City`, `Club`, `DegreeProgram`, `ProgramSpecialization`, `MediaAsset`, `College`, `CollegeContact`, `ClubCollege`, `CollegeMediaAsset`, `CollegeDegreeProgram`, `Company`, `CompanyClub`, `CompanyMediaAsset`, `CompanyContact`, `CompanyService`, `CompanyProduct`, `CompanyHiringStat`, `CompanyHiringRole`, `CompanyHiringDomain`, `CompanyCompensationStat`

---

### 2. Migration SQL

**File:** `prisma/migrations/20260401100000_refactor_bigint_pks/migration.sql`

**Strategy:** DROP all tables (CASCADE), then CREATE with new structure.

> This is destructive. The database must be reseeded after this migration.
> Suitable for development environments only — do NOT run on shared staging/production.

**Execution order:**
1. `DROP TABLE ... CASCADE` — all tables (order doesn't matter with CASCADE)
2. `CREATE TABLE` — in dependency order (no-dep tables first, then dependents)

---

### 3. Seed Files (`prisma/seeds/`)

**Affected files (~3):**
- `college-operations.seed.ts`
- `company-organization.seed.ts`
- `wrcf-reference.seed.ts`

**Changes needed:**

| Before | After |
|---|---|
| `id: 'some-uuid-string'` | Remove — autoincrement handles it |
| `tenantId: SYSTEM_TENANT_ID` (string) | Query for tenant's BigInt id first, then pass |
| `createdBy: 'system'` or string UUID | Pass BigInt id of the seeded admin user |
| FK values as UUID strings | Resolve to BigInt ids via prior queries |

**Pattern for seed lookups:**
```ts
// Resolve BigInt id from publicUuid
const tenant = await prisma.tenant.findUnique({ where: { publicUuid: SYSTEM_TENANT_UUID } });
await prisma.college.create({ data: { tenantId: tenant.id, createdBy: adminUser.id, ... } });
```

---

### 4. Prisma Repositories (Infrastructure Layer)

**Affected files (~74 across all bounded contexts)**

Locations:
- `libs/contexts/*/src/infrastructure/persistence/postgres/repositories/`

**Changes needed:**

| Operation | Before | After |
|---|---|---|
| Find by ID | `where: { id }` | `where: { publicUuid: id }` |
| Create | `data: { id: uuid(), ... }` | `data: { publicUuid: uuid(), ... }` (remove explicit id) |
| Update | `where: { id }` | `where: { publicUuid: id }` |
| Delete | `where: { id }` | `where: { publicUuid: id }` |
| FK fields | `tenantId: string` | `tenantId: BigInt` — must resolve BigInt from UUID |
| `createdBy` / `updatedBy` | `string` | `BigInt` — must pass resolved BigInt user id |

**Important:** Prisma returns `BigInt` in JavaScript. BigInt does not JSON-serialize by default. The repo must **never** expose BigInt to upper layers — always map to `string` (publicUuid) before returning to the domain.

---

### 5. Domain Layer (`libs/contexts/*/src/domain/`)

**No changes required.**

Domain aggregates keep `readonly id: string`. This `id` is the `publicUuid` semantically. The domain never knows about BigInt.

---

### 6. Application Layer (`libs/contexts/*/src/application/`)

**No changes required.**

Commands, queries, handlers, DTOs all continue to use string IDs.

---

### 7. Core API Routes (`apps/api/core-api/src/modules/`)

**No changes required.**

Route params remain string UUIDs (they are `publicUuid` values):
```ts
// Still works unchanged
const { id } = request.params as { id: string }
await deps.getCollege.execute({ collegeId: id })  // id = publicUuid
```

---

### 8. BFF Routes (`apps/api/bff/src/modules/`)

**No changes required.**

BFF proxies string params transparently.

---

### 9. Frontend (`apps/web/admin-portal/`)

**No changes required.**

Angular models keep `id: string`. HTTP calls still send/receive UUID strings.

---

## File Impact Summary

| Layer | Files Affected | Effort |
|---|---|---|
| `prisma/schema.prisma` | 1 | High — full rewrite |
| Migration SQL | 1 | High — DROP + CREATE all tables |
| Seed files | ~3 | Medium — resolve BigInt IDs |
| Prisma repos (infrastructure) | ~74 | Medium — `id` → `publicUuid` in where clauses |
| Domain / Application / API / BFF / Frontend | **0** | None |
| **Total** | **~79** | |

---

## Execution Steps

```bash
# 1. Update schema.prisma (done per plan above)

# 2. Apply migration (will reset DB)
pnpm run prisma:migrate:dev

# 3. Regenerate Prisma client
pnpm run prisma:generate

# 4. Reseed
pnpm run db:setup
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Data loss** — migration drops all tables | Dev environment only; reseed after migration |
| **BigInt JSON serialization** — JS `BigInt` can't be `JSON.stringify`'d | Repos must map to `string` (publicUuid) before returning to domain; never expose BigInt upward |
| **`createdBy` / `updatedBy`** — currently some seeds pass `'system'` strings | Seeds must first create/find an admin UserAccount and use its BigInt `id` |
| **Missed FK fields** — some FK-like fields (e.g., `learnerId`, `reportingTo`) aren't Prisma relations | Treat them the same — change to `BigInt`, resolve from `publicUuid` at the repo layer |
| **Composite join tables** — changing `@@id` to `@@unique` could affect uniqueness enforcement | `@@unique` enforces the same constraint; verify no queries depend on the composite PK directly |
