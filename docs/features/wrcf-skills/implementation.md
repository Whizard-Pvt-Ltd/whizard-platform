# WRCF Skills — Implementation Result

## Status: Complete ✓ (Build: All 9 projects passing)

---

## What Was Built

Full-stack implementation of the WRCF Skills feature: Skills → Tasks → Control Points, scoped to a Capability Instance (CI). Entry point is the "Skill+" button on saved CI rows in the Manage CI Mappings dialog.

---

## Files Created

### Database

| File | Purpose |
|---|---|
| `prisma/migrations/20260324000000_add_skills_tasks_control_points/migration.sql` | Creates `skills`, `tasks`, `control_points` tables with FK constraints |

### Prisma Schema Changes (`prisma/schema.prisma`)

- Added `Skill`, `Task`, `ControlPoint` models
- Added `skills Skill[]` relation on `CapabilityInstance`

### Domain Layer (`libs/contexts/capability-framework/src/domain/`)

| File | Purpose |
|---|---|
| `aggregates/skill.aggregate.ts` | Skill aggregate — create/reconstitute/update/delete with domain events |
| `aggregates/task.aggregate.ts` | Task aggregate |
| `aggregates/control-point.aggregate.ts` | ControlPoint aggregate |
| `repositories/skill.repository.ts` | `ISkillRepository` interface |
| `repositories/task.repository.ts` | `ITaskRepository` interface |
| `repositories/control-point.repository.ts` | `IControlPointRepository` interface |

### Application Layer (`libs/contexts/capability-framework/src/application/`)

| File | Purpose |
|---|---|
| `commands/skill.commands.ts` | `CreateSkillCommand`, `UpdateSkillCommand`, `DeleteSkillCommand` |
| `commands/task.commands.ts` | `CreateTaskCommand`, `UpdateTaskCommand`, `DeleteTaskCommand` |
| `commands/control-point.commands.ts` | `CreateControlPointCommand`, `UpdateControlPointCommand`, `DeleteControlPointCommand` |
| `command-handlers/skill.handlers.ts` | Create/Update/Delete handlers |
| `command-handlers/task.handlers.ts` | Create/Update/Delete handlers |
| `command-handlers/control-point.handlers.ts` | Create/Update/Delete handlers |
| `query-handlers/list-skills.handler.ts` | `ListSkillsQueryHandler` — delegates to `findAllDtos` |
| `query-handlers/list-tasks.handler.ts` | `ListTasksQueryHandler` |
| `query-handlers/list-control-points.handler.ts` | `ListControlPointsQueryHandler` |
| `dto/skill.dto.ts` | `SkillDto` |
| `dto/task.dto.ts` | `TaskDto` |
| `dto/control-point.dto.ts` | `ControlPointDto` |

### Infrastructure Layer (`libs/contexts/capability-framework/src/infrastructure/`)

| File | Purpose |
|---|---|
| `postgres/repositories/prisma-skill.repository.ts` | Soft-delete (`isActive: false`) pattern, `findAllDtos` ordered by name |
| `postgres/repositories/prisma-task.repository.ts` | Same pattern |
| `postgres/repositories/prisma-control-point.repository.ts` | Same pattern |

### API Layer

| File | Changes |
|---|---|
| `libs/contexts/capability-framework/src/index.ts` | Exports all new aggregates, interfaces, commands, handlers, DTOs, repositories |
| `apps/api/core-api/src/modules/wrcf/runtime.ts` | Wired 3 new repos + 12 new handlers into `WrcfModuleDependencies` |
| `apps/api/core-api/src/modules/wrcf/routes.ts` | 12 new routes (GET/POST/PATCH/DELETE for skills, tasks, control-points) |
| `apps/api/bff/src/modules/wrcf/routes.ts` | 12 proxy routes forwarding to core API |

### Angular Frontend (`apps/web/admin-portal/src/app/pages/wrcf-skills/`)

| File | Purpose |
|---|---|
| `models/wrcf-skills.models.ts` | `SkillItem`, `TaskItem`, `ControlPointItem`, `SkillsPanelState` |
| `services/wrcf-skills-api.service.ts` | HTTP service — all 12 CRUD endpoints |
| `components/skills-panel/skills-panel.component.ts` | Create/Edit panel — renders different form fields per entity |
| `components/skills-panel/skills-panel.component.html` | Panel template with validation error display |
| `components/skills-panel/skills-panel.component.css` | Teal header (`#00BFFF`), WRCF design system tokens |
| `wrcf-skills.component.ts` | Main page — 7-dropdown cascaded filter, CI resolution, 3-column layout |
| `wrcf-skills.component.html` | Page template |
| `wrcf-skills.component.css` | Full WRCF design system (Poppins, color tokens) |

### Modified Files

| File | Change |
|---|---|
| `apps/web/admin-portal/src/app/app.routes.ts` | Added `/wrcf-skills` route (auth-guarded) |
| `apps/web/admin-portal/src/app/pages/industry-wrcf/components/manage-ci-mappings/manage-ci-mappings.component.ts` | Injected `Router`, added `onSkillPlusClick()` |
| `apps/web/admin-portal/src/app/pages/industry-wrcf/components/manage-ci-mappings/manage-ci-mappings.component.html` | Added `Skill+` button on each saved CI row |
| `apps/web/admin-portal/src/app/pages/industry-wrcf/components/manage-ci-mappings/manage-ci-mappings.component.css` | Styled `Skill+` button (teal, 24px height) |

---

## API Endpoints

All under `/api/wrcf/`, all guarded by `WRCF.MANAGE` authorization.

| Method | URL | Action |
|---|---|---|
| GET | `/skills?ciId=:ciId` | List skills for a CI |
| POST | `/skills` | Create skill |
| PATCH | `/skills/:id` | Update skill |
| DELETE | `/skills/:id` | Soft-delete skill |
| GET | `/tasks?skillId=:skillId` | List tasks for a skill |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Soft-delete task |
| GET | `/control-points?taskId=:taskId` | List control points for a task |
| POST | `/control-points` | Create control point |
| PATCH | `/control-points/:id` | Update control point |
| DELETE | `/control-points/:id` | Soft-delete control point |

---

## Data Model

```
CapabilityInstance
  └── Skill (many)             ciId FK
        ├── cognitiveType      Procedural | Decision | Diagnostic
        ├── skillCriticality   Low | Medium | High
        ├── recertificationCycle  1–12 (months)
        ├── aiImpact           Low | Medium | High
        └── Task (many)        skillId FK
              ├── frequency    Daily | Weekly | Rare
              ├── complexity   Low | Medium | High
              ├── standardDuration  (minutes, optional)
              ├── requiredProficiencyLevel  (optional)
              └── ControlPoint (many)  taskId FK
                    ├── riskLevel          Low | Medium | High | Critical
                    ├── failureImpactType  Safety | Compliance | Financial
                    ├── kpiThreshold       (optional)
                    ├── escalationRequired Yes | No
                    └── evidenceType       Log | Email | Picture | Consent Of Validator
```

---

## UX Flow

1. User opens **Manage CI Mappings** dialog from Industry WRCF page
2. Each saved CI row shows a **Skill+** button (teal, beside the trash icon)
3. Clicking **Skill+** navigates to `/wrcf-skills?ciId=xxx` and closes the dialog
4. The WRCF Skills page loads with all 5 filter dropdowns pre-resolved from the CI (sector → industry → FG → PWO → SWO → capability → proficiency)
5. Skills column shows existing skills for that CI; `+` header button opens the Create Skill panel
6. Selecting a skill loads its Tasks; selecting a task loads its Control Points
7. The slide-in panel has a **teal header** (`#00BFFF`) — distinct from the blue (`#314DDF`) used on column headers
8. Edit mode pre-populates the form; a Delete button is shown only in edit mode
9. Navigating directly to `/wrcf-skills` (no query params) shows empty dropdowns; all 5 must be selected to resolve a CI

---

## Pending (to run locally)

```bash
pnpm prisma:migrate:dev
# When prompted for migration name: add_skills_tasks_control_points
```
