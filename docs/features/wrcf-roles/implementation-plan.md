# WRCF Roles — Implementation Plan

## Overview

The **Manage WRCF Roles** feature lets admin users define Departments and Industry Roles for a selected Industry, then assign Capability Instances (CIs) to those roles. It has two sub-features:

1. **Create/Edit Department and Roles** — manage Department and IndustryRole master data
2. **Assign CI to Role** — map existing CIs to a Department→Role combination via a 5-column selection UI (same pattern as the Industry WRCF CI mapping screen)

Entry point: new `/wrcf-roles` route in the Angular admin portal, accessible from the main nav drawer.

---

## UX Summary

- **Header**: "Manage WRCF Roles", same header pattern as other WRCF pages
- **Top bar**: Industry dropdown (pre-select first) | Department dropdown | Role dropdown | `+Add` split button (dropdown: "Add Department" / "Add Role") | `Edit` split button (dropdown: "Edit Department" / "Edit Role") | `Mappings` badge button
- **5-column layout**: Functional Group | Primary Work Obj. | Secondary Work Obj. | Capabilities | Proficiency Level
  - Columns 1–3 are single-select; Capabilities is single-select; Proficiency Level is **checkbox** (multi-select)
- **FG column**: shows only FGs mapped to the selected Department (not all FGs)
- **Auto-select**: on Department select → auto-select first FG → auto-select first PWO → auto-select first SWO → load Capabilities
- **Mappings badge button**: opens "Manage CI Mappings" dialog — shows local cache (pending saves) grouped by PWO; each row: "SWO · Capability · Proficiency Level" with delete icon; `Save` button commits to DB
- **Guard**: if user tries to change Role while mappings are in local cache → prompt "Save or Discard mappings before changing role"
- **Create Department panel** (teal `#00BFFF` header): Name* | FG Mapping (multi-select) | Operational Criticality Score | Revenue Contribution Weight | Regulatory Exposure Level
- **Edit Department panel**: same fields pre-populated
- **Create Role panel** (teal header): Name* | Seniority Level* (dropdown) | Reporting To (text) | Role Criticality Score
- **Edit Role panel**: same fields pre-populated

---

## Data Model

### New Prisma Models

```prisma
model Department {
  id                          String                @id @default(uuid())
  tenantId                    String
  industryId                  String
  industry                    Industry              @relation(fields: [industryId], references: [id])
  name                        String
  operationalCriticalityScore Float?
  revenueContributionWeight   Float?
  regulatoryExposureLevel     Float?
  isActive                    Boolean               @default(true)
  createdBy                   String
  createdOn                   DateTime              @default(now())
  updatedBy                   String?
  updatedOn                   DateTime?             @updatedAt
  fgMappings                  DepartmentFGMapping[]
  roles                       IndustryRole[]
  @@map("departments")
}

model DepartmentFGMapping {
  id             String          @id @default(uuid())
  departmentId   String
  department     Department      @relation(fields: [departmentId], references: [id])
  fgId           String
  functionalGroup FunctionalGroup @relation(fields: [fgId], references: [id])
  @@unique([departmentId, fgId])
  @@map("department_fg_mappings")
}

model IndustryRole {
  id                   String          @id @default(uuid())
  tenantId             String
  departmentId         String
  department           Department      @relation(fields: [departmentId], references: [id])
  industryId           String
  name                 String
  seniorityLevel       String          // Intern | Trainee | Associate | Team Lead | Manager | Director
  reportingTo          String?
  roleCriticalityScore Float?
  isActive             Boolean         @default(true)
  createdBy            String
  createdOn            DateTime        @default(now())
  updatedBy            String?
  updatedOn            DateTime?       @updatedAt
  ciMappings           RoleCIMapping[]
  @@map("industry_roles")
}

model RoleCIMapping {
  id        String            @id @default(uuid())
  roleId    String
  role      IndustryRole      @relation(fields: [roleId], references: [id])
  ciId      String
  ci        CapabilityInstance @relation(fields: [ciId], references: [id])
  createdBy String
  createdOn DateTime          @default(now())
  @@unique([roleId, ciId])
  @@map("role_ci_mappings")
}
```

Also add relations to existing models:
- `departments Department[]` on `Industry`
- `fgMappings DepartmentFGMapping[]` on `FunctionalGroup`
- `roleCiMappings RoleCIMapping[]` on `CapabilityInstance`

Migration name: `add_departments_roles_ci_mappings`

---

## Files To Create

| File | Purpose |
|---|---|
| `libs/contexts/capability-framework/src/domain/aggregates/department.aggregate.ts` | Department domain aggregate |
| `libs/contexts/capability-framework/src/domain/aggregates/industry-role.aggregate.ts` | IndustryRole domain aggregate |
| `libs/contexts/capability-framework/src/domain/repositories/department.repository.ts` | IDepartmentRepository interface |
| `libs/contexts/capability-framework/src/domain/repositories/industry-role.repository.ts` | IIndustryRoleRepository interface |
| `libs/contexts/capability-framework/src/domain/repositories/role-ci-mapping.repository.ts` | IRoleCIMappingRepository interface |
| `libs/contexts/capability-framework/src/application/commands/department.commands.ts` | Create/Update/Delete commands |
| `libs/contexts/capability-framework/src/application/commands/industry-role.commands.ts` | Create/Update/Delete commands |
| `libs/contexts/capability-framework/src/application/commands/role-ci-mapping.commands.ts` | Save/Delete commands |
| `libs/contexts/capability-framework/src/application/command-handlers/department.handlers.ts` | Create/Update/Delete handlers |
| `libs/contexts/capability-framework/src/application/command-handlers/industry-role.handlers.ts` | Create/Update/Delete handlers |
| `libs/contexts/capability-framework/src/application/command-handlers/role-ci-mapping.handlers.ts` | Save/Delete handlers |
| `libs/contexts/capability-framework/src/application/query-handlers/list-departments.handler.ts` | ListDepartmentsQueryHandler |
| `libs/contexts/capability-framework/src/application/query-handlers/list-industry-roles.handler.ts` | ListIndustryRolesQueryHandler |
| `libs/contexts/capability-framework/src/application/query-handlers/list-role-ci-mappings.handler.ts` | ListRoleCIMappingsQueryHandler |
| `libs/contexts/capability-framework/src/infrastructure/persistence/postgres/repositories/prisma-department.repository.ts` | Prisma implementation |
| `libs/contexts/capability-framework/src/infrastructure/persistence/postgres/repositories/prisma-industry-role.repository.ts` | Prisma implementation |
| `libs/contexts/capability-framework/src/infrastructure/persistence/postgres/repositories/prisma-role-ci-mapping.repository.ts` | Prisma implementation |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/wrcf-roles.component.ts` | Main page component |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/wrcf-roles.component.html` | Page template |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/wrcf-roles.component.css` | Page styles |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/models/wrcf-roles.models.ts` | Department/Role/Mapping interfaces |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/services/wrcf-roles-api.service.ts` | HTTP service |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/roles-panel/roles-panel.component.ts` | Create/Edit Department + Role panel |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/roles-panel/roles-panel.component.html` | Panel template |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/roles-panel/roles-panel.component.css` | Panel styles |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/ci-mappings-dialog/ci-mappings-dialog.component.ts` | Mappings dialog |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/ci-mappings-dialog/ci-mappings-dialog.component.html` | Mappings dialog template |
| `apps/web/admin-portal/src/app/pages/wrcf-roles/components/ci-mappings-dialog/ci-mappings-dialog.component.css` | Mappings dialog styles |

---

## Files To Modify

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add 4 new models + relations on Industry, FunctionalGroup, CapabilityInstance |
| `libs/contexts/capability-framework/src/index.ts` | Export all new aggregates, interfaces, handlers |
| `apps/api/core-api/src/modules/wrcf/runtime.ts` | Wire 3 new repos + handlers into WrcfModuleDependencies |
| `apps/api/core-api/src/modules/wrcf/routes.ts` | Add 11 new routes |
| `apps/api/bff/src/modules/wrcf/routes.ts` | Add 11 proxy routes |
| `apps/web/admin-portal/src/app/app.routes.ts` | Add `/wrcf-roles` lazy-loaded auth-guarded route |

---

## Step 1 — Prisma Schema + Migration

Add 4 models to `prisma/schema.prisma`. Add the following relations to existing models:

```prisma
// on Industry
departments Department[]

// on FunctionalGroup
fgMappings DepartmentFGMapping[]

// on CapabilityInstance
roleCiMappings RoleCIMapping[]
```

Run: `pnpm prisma:migrate:dev` → name: `add_departments_roles_ci_mappings`

---

## Step 2 — Domain Aggregates

Follow the existing `capability-instance.aggregate.ts` pattern.

**DepartmentProps**:
```ts
{ id, tenantId, industryId, name, fgIds: string[], operationalCriticalityScore?, revenueContributionWeight?, regulatoryExposureLevel?, createdBy }
```

**IndustryRoleProps**:
```ts
{ id, tenantId, departmentId, industryId, name, seniorityLevel, reportingTo?, roleCriticalityScore?, createdBy }
```

Both aggregates implement: static `create()` (emits Created event), `update()` (emits Updated event), `delete()` (emits Deleted event), `reconstitute()` (no events).

Note: `fgIds` in `DepartmentProps` represents the FG mapping array — the Prisma repo handles the junction table separately.

---

## Step 3 — Repository Interfaces

Interfaces must use **inline return types** (no DTO imports) per the DDD layer rule.

```ts
// IDepartmentRepository
findByIndustryId(tenantId: string, industryId: string): Promise<{
  id: string; name: string; industryId: string; fgIds: string[];
  operationalCriticalityScore?: number; revenueContributionWeight?: number; regulatoryExposureLevel?: number;
}[]>;
findById(id: string): Promise<Department | null>;
save(dept: Department, fgIds: string[]): Promise<void>;
update(dept: Department, fgIds: string[]): Promise<void>;
delete(id: string): Promise<void>;

// IIndustryRoleRepository
findByDepartmentId(tenantId: string, departmentId: string): Promise<{
  id: string; name: string; departmentId: string;
  seniorityLevel: string; reportingTo?: string; roleCriticalityScore?: number;
}[]>;
findById(id: string): Promise<IndustryRole | null>;
save(role: IndustryRole): Promise<void>;
update(role: IndustryRole): Promise<void>;
delete(id: string): Promise<void>;

// IRoleCIMappingRepository
findByRoleId(roleId: string): Promise<{ id: string; roleId: string; ciId: string }[]>;
save(roleId: string, ciId: string, createdBy: string): Promise<void>;
delete(id: string): Promise<void>;
deleteByRoleId(roleId: string): Promise<void>;
```

---

## Step 4 — Commands

```ts
// department.commands.ts
CreateDepartmentCommand:  { tenantId, industryId, name, fgIds: string[], operationalCriticalityScore?, revenueContributionWeight?, regulatoryExposureLevel?, createdBy }
UpdateDepartmentCommand:  { id, tenantId, name?, fgIds?, operationalCriticalityScore?, revenueContributionWeight?, regulatoryExposureLevel?, updatedBy }
DeleteDepartmentCommand:  { id, tenantId }

// industry-role.commands.ts
CreateIndustryRoleCommand: { tenantId, departmentId, industryId, name, seniorityLevel, reportingTo?, roleCriticalityScore?, createdBy }
UpdateIndustryRoleCommand: { id, tenantId, name?, seniorityLevel?, reportingTo?, roleCriticalityScore?, updatedBy }
DeleteIndustryRoleCommand: { id, tenantId }

// role-ci-mapping.commands.ts
SaveRoleCIMappingsCommand:  { roleId, ciIds: string[], createdBy }  // replaces all mappings for the role
DeleteRoleCIMappingCommand: { id: string }
```

---

## Step 5 — Command Handlers

Mirror the `capability-instance.handlers.ts` pattern.

- `CreateDepartmentCommandHandler`, `UpdateDepartmentCommandHandler`, `DeleteDepartmentCommandHandler` — inject `IDepartmentRepository`
- `CreateIndustryRoleCommandHandler`, `UpdateIndustryRoleCommandHandler`, `DeleteIndustryRoleCommandHandler` — inject `IIndustryRoleRepository`
- `SaveRoleCIMappingsCommandHandler` — calls `deleteByRoleId` then bulk-saves new CIs; inject `IRoleCIMappingRepository`
- `DeleteRoleCIMappingCommandHandler` — inject `IRoleCIMappingRepository`

---

## Step 6 — Query Handlers

```ts
ListDepartmentsQueryHandler.execute(tenantId, industryId)
  → repo.findByIndustryId(tenantId, industryId)

ListIndustryRolesQueryHandler.execute(tenantId, departmentId)
  → repo.findByDepartmentId(tenantId, departmentId)

ListRoleCIMappingsQueryHandler.execute(roleId)
  → repo.findByRoleId(roleId)
```

---

## Step 7 — Prisma Repositories

**PrismaDepartmentRepository**:
- `save()`: transaction — creates `Department` + upserts `DepartmentFGMapping` rows
- `update()`: transaction — updates `Department` + reconciles `DepartmentFGMapping` rows (delete removed, upsert new)

**PrismaIndustryRoleRepository**:
- Straightforward single-table CRUD; soft-delete via `isActive: false`

**PrismaRoleCIMappingRepository**:
- `deleteByRoleId` + bulk insert for `SaveRoleCIMappings`

---

## Step 8 — Core API Routes (11 new endpoints)

All write endpoints guarded by `authorizationPreHandler('WRCF.MANAGE')`.

```
GET    /departments?industryId=:id       → listDepts.execute(tenantId, industryId)
POST   /departments                      → createDept.execute({ tenantId, createdBy, ...body })
PATCH  /departments/:id                  → updateDept.execute({ id, tenantId, updatedBy, ...body })
DELETE /departments/:id                  → deleteDept.execute({ id, tenantId })

GET    /industry-roles?departmentId=:id  → listRoles.execute(tenantId, departmentId)
POST   /industry-roles                   → createRole.execute({ tenantId, createdBy, ...body })
PATCH  /industry-roles/:id               → updateRole.execute({ id, tenantId, updatedBy, ...body })
DELETE /industry-roles/:id               → deleteRole.execute({ id, tenantId })

GET    /role-ci-mappings?roleId=:id      → listRoleCIMappings.execute(roleId)
POST   /role-ci-mappings                 → saveRoleCIMappings.execute({ roleId, ciIds, createdBy })
DELETE /role-ci-mappings/:id             → deleteRoleCIMapping.execute({ id })
```

Response envelope: `{ success: true, data: [...] }`.

---

## Step 9 — BFF Proxy Routes

11 new routes using the existing `forwardToCore` helper. GET routes forward query string via `getQueryString(request)`.

Pattern to follow: `apps/api/bff/src/modules/wrcf/routes.ts`.

---

## Step 10 — Angular Page (WrcfRolesComponent)

**Route**: `/wrcf-roles` in `app.routes.ts` — auth-guarded, lazy-loaded.

### State Signals

```ts
industries            = signal<Industry[]>([])
departments           = signal<Department[]>([])
roles                 = signal<IndustryRole[]>([])
selectedIndustryId    = signal<string | null>(null)
selectedDepartmentId  = signal<string | null>(null)
selectedRoleId        = signal<string | null>(null)

// 5-column data
fgList                = signal<FunctionalGroup[]>([])      // department's FGs only
pwoList               = signal<PrimaryWorkObject[]>([])
swoList               = signal<SecondaryWorkObject[]>([])
capabilities          = signal<Capability[]>([])
proficiencyLevels     = signal<ProficiencyLevel[]>([])

selectedFGId          = signal<string | null>(null)
selectedPWOId         = signal<string | null>(null)
selectedSWOId         = signal<string | null>(null)
selectedCapabilityId  = signal<string | null>(null)
checkedProficiencyIds = signal<string[]>([])               // multi-select checkboxes

pendingMappings       = signal<PendingCIMapping[]>([])     // local cache before save
savedMappingCount     = computed(() => pendingMappings().length)

panel                 = signal<RolesPanelState>({ open: false, mode: 'create', entity: 'Department' })
mappingsDialogOpen    = signal(false)
editDropdownOpen      = signal(false)
drawerOpen            = signal(false)
errorMessage          = signal<string | null>(null)
```

### Top-Bar Behaviour

- On init: load all industries → auto-select first → load departments → auto-select first → load roles → auto-select first
- Industry change: reload departments → auto-select first → reload roles → auto-select first → load FGs for new dept
- Department change: guard (if `pendingMappings().length > 0` → prompt save/discard) → reload roles → auto-select first → load dept FGs
- Role change: guard (same pending mapping check)
- `+Add` split button: dropdown with "Add Department" / "Add Role" (disable "Add Role" if no dept selected)
- `Edit` split button: "Edit Department" / "Edit Role"
- `Mappings` badge: opens CI mappings dialog; badge count = `pendingMappings().length`

### 5-Column Cascade

- FG column: populated from the selected department's `fgIds` (no extra API call)
- FG select → load PWOs for that FG → auto-select first → load SWOs → auto-select first → load Capabilities from CIs for SWO
- Capability select → filter Proficiency Levels to those in CIs for that SWO+Capability
- Proficiency Level checkboxes: each check adds a `PendingCIMapping` to local cache (resolve CI ID by SWO+Capability+Proficiency lookup)

### PendingCIMapping Shape

```ts
interface PendingCIMapping {
  ciId: string;
  fgName: string;
  pwoName: string;
  swoName: string;
  capabilityName: string;
  proficiencyLabel: string;
}
```

### Template

- Reuse `<whizard-wrcf-column>` for FG/PWO/SWO/Capabilities columns with `[showAdd]="false" [showEdit]="false"`
- Proficiency Level column uses `<whizard-wrcf-column [checkboxMode]="true">`
- Reuse `WrcfApiService` for `listFGs`, `listPWOs`, `listSWOs`, `listCIs`, `listCapabilities`, `listProficiencies`
- Include `<whizard-nav-drawer>` and `<whizard-ci-mappings-dialog>`

---

## Step 11 — RolesPanelComponent

**Inputs**: `state: RolesPanelState`, `availableFGs: FunctionalGroup[]`
**Outputs**: `save: EventEmitter`, `delete: EventEmitter`, `close: EventEmitter<void>`

Panel header: teal `#00BFFF` background, dark `#0F172A` text.

**Department fields** (Name and FG Mapping are required):
- Name — text input
- FG Mapping — multi-select checkboxes from `availableFGs`
- Operational Criticality Score — number input
- Revenue Contribution Weight — number input
- Regulatory Exposure Level — number input

**Role fields** (Name and Seniority Level are required):
- Name — text input
- Seniority Level — select: Intern | Trainee | Associate | Team Lead | Manager | Director
- Reporting To — text input
- Role Criticality Score — number input

Edit mode: pre-populate all fields from `state.data`. Show Delete button in edit mode.

---

## Step 12 — CIMappingsDialogComponent

**Inputs**: `mappings: PendingCIMapping[]`, `industryName: string`, `departmentName: string`, `roleName: string`
**Outputs**: `remove: EventEmitter<number>` (index), `save: EventEmitter<void>`, `close: EventEmitter<void>`

Dialog layout (follow `manage-ci-mappings` pattern):
- Title: "Manage CI Mappings"
- Context line: Industry → Department → Role
- List: grouped by PWO name; each row = "SWO · Capability · Proficiency" + trash icon
- Footer: `Save` button (primary) + `Cancel`
- On `Save`: emit `save` → parent calls `POST /role-ci-mappings` with all `ciIds` + `roleId` → clear `pendingMappings`

---

## Key Patterns to Reuse

| Pattern | Source |
|---|---|
| Module wiring | `apps/api/core-api/src/modules/wrcf/runtime.ts` |
| Route registration | `apps/api/core-api/src/modules/wrcf/routes.ts` |
| BFF proxy | `apps/api/bff/src/modules/wrcf/routes.ts` |
| Domain aggregate | `libs/contexts/capability-framework/src/domain/aggregates/capability-instance.aggregate.ts` |
| Mappings dialog | `apps/web/admin-portal/src/app/pages/industry-wrcf/components/manage-ci-mappings/` |
| Filter cascade + signals | `apps/web/admin-portal/src/app/pages/wrcf-skills/wrcf-skills.component.ts` |

---

## Verification Checklist

1. `pnpm build` — zero TypeScript errors
2. `pnpm prisma:migrate:dev` — migration applies; 4 new tables visible in DB
3. Start all services; navigate to `/wrcf-roles`
4. All industries load; first industry auto-selected; departments and roles auto-populated
5. Click `+Add` → "Add Department" → fill Name + select FGs → save → dept appears in dropdown
6. Click `+Add` → "Add Role" (with dept selected) → fill Name + Seniority Level → save → role in dropdown
7. Select FG column → PWO auto-selects → SWO auto-selects → Capabilities load → check proficiency checkboxes → Mappings badge count increments
8. Click Mappings badge → dialog shows pending mappings → click `Save` → persisted to DB
9. Try changing Role with pending mappings → guard prompt appears
10. Click `Edit` → "Edit Department" → panel pre-populated → update → saved
11. Delete dept with no roles → removed from dropdown
