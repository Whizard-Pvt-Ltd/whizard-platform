# During Internship Tab — Implementation Plan

claude --resume c7067e06-ac42-4bb2-adfe-a7b290d56caa

## 1. Data Model (Prisma Schema)

### New table: `internship_plans`

| Field                | Type                                | Notes               |
| -------------------- | ----------------------------------- | ------------------- |
| id                   | BigInt (PK)                         | auto-increment      |
| publicUuid           | String (unique)                     | uuid                |
| internshipId         | BigInt (FK -> internships)          | cascade delete      |
| pwoId                | BigInt (FK -> pwos)                 | PWO selected        |
| capabilityInstanceId | BigInt (FK -> capability_instances) | CI selected         |
| mentorUserId         | BigInt                              | company user        |
| noOfWeeks            | Int                                 | weeks for this plan |
| orderIndex           | Int                                 | display order       |
| createdOn            | DateTime                            |                     |

### New table: `internship_schedules`

| Field            | Type                            | Notes                         |
| ---------------- | ------------------------------- | ----------------------------- |
| id               | BigInt (PK)                     | auto-increment                |
| publicUuid       | String (unique)                 | uuid                          |
| internshipPlanId | BigInt (FK -> internship_plans) | cascade delete                |
| taskId           | BigInt (FK -> tasks)            | selected task                 |
| evidence         | Text                            | from control_points, editable |
| createdOn        | DateTime                        |                               |

## 2. New API Endpoints

| Method | Route                                                  | Purpose                                                       |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------- |
| GET    | `/api/internships/pwos?functionalGroupId=X&roleId=Y` | List PWOs for selected FG+role                                |
| GET    | `/api/internships/capability-instances?pwoId=X`      | List CIs for selected PWO (name = SWO+Capability+Proficiency) |
| GET    | `/api/internships/skills?capabilityInstanceId=X`     | List skills for a CI                                          |
| GET    | `/api/internships/tasks?skillIds=X,Y`                | List tasks + control_points for skills                        |
| GET    | `/api/internships/:id/plans`                         | Get saved plans + schedules                                   |
| POST   | `/api/internships/:id/plans`                         | Save/replace all plans + schedules                            |

## 3. Frontend — During Internship Tab

### Screen 1 — Internship Plan Form

- "During Internship Phase" header (#8AB4F8)
- "Total No. of weeks" input (readonly, calculated from durationMonths * 4)
- Divider line
- "Internship Plan" section with "Add" button
- Form array rows inside bg-whizard-bg-secondary card:
  - PWO dropdown (filtered by FG + role)
  - Mentor dropdown (from coordinators, single-select)
  - Capability Instance dropdown (filtered by PWO, name = SWO+Capability+ProficiencyLevel)
  - No. of Weeks number input
- "Create Schedule" button (bottom-right)
- Validation: sum of plan weeks must equal totalWeeks
- Snackbar on validation failure (MatSnackBar, top-right, 5s, close button)
- Confirmation dialog (MatDialog) before creating schedule

### Screen 2 — Internship Schedule Accordions

- One accordion per plan item
- Accordion header: PWO name | Mentor name | CI name (right-aligned)
- Accordion body:
  - Skills multi-select filter
  - Tasks with mat-checkbox (not editable) + evidence (editable)
  - Tasks selected in other plans are disabled
- "Edit Plan" button replaces "Create Schedule" after confirmation
- "Edit Plan" shows MatDialog confirmation, resets all schedules

### Locking Behavior

- Once confirmed, plan rows become read-only
- "Edit Plan" button appears at same position as "Create Schedule"
- Clicking "Edit Plan" resets schedules with confirmation

## 4. Files to Modify

| File                                                               | Change                                           |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| `prisma/schema.prisma`                                           | Add InternshipPlan and InternshipSchedule models |
| `apps/api/core-api/src/modules/internship-hiring/routes.ts`      | Add 6 new route handlers                         |
| `apps/api/bff/src/modules/internship-hiring/routes.ts`           | Add BFF proxy for new routes                     |
| `apps/web/admin-portal/.../during-internship-tab.component.ts`   | Complete rewrite with reactive forms             |
| `apps/web/admin-portal/.../during-internship-tab.component.html` | Complete rewrite matching Figma                  |
| `apps/web/admin-portal/.../manage-internship.models.ts`          | Add new interfaces                               |
| `apps/web/admin-portal/.../manage-internship-api.service.ts`     | Add methods for new endpoints                    |
| `apps/web/admin-portal/.../internship-form.component.ts`         | Pass additional inputs to during-internship tab  |
| `apps/web/admin-portal/.../internship-form.component.html`       | Add new inputs/outputs                           |

## 5. Business Rules

- Total weeks = durationMonths * 4, cannot be exceeded by sum of plan weeks
- PWO filtered by FG (selection tab) + role (details tab)
- CI name format: SWO + Capability + Proficiency Level
- First plan row shown by default with first values pre-selected
- Changing PWO reloads CI dropdown for that row
- Tasks unique across plans (disabled if already selected elsewhere)
- Tasks not editable, evidence editable
- Plan locked after confirmation, editable again via "Edit Plan" with dialog
