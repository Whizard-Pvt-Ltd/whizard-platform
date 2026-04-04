# Implementation Plan: Internship Management

## What's being built
A full-stack "Manage Internship" page in the admin portal: a left-sidebar list of internships + a right-panel with 5-tab detail/form (Details, Screening Criteria, Selection, During Internship, Final Submission). The left panel switches to an assessment library when adding/editing.

---

## 1. Data Model (Prisma)

### `Internship` (`@@map("internships")`)
| Field | Type | Notes |
|---|---|---|
| id | BigInt PK auto | |
| tenantId | BigInt | FK |
| title | String | |
| bannerImageUrl | String? | S3 URL |
| vacancies | Int | |
| cityId | BigInt? | FK to cities |
| stipend | Decimal? | in Rupees |
| durationMonths | Int | |
| applicationDeadline | DateTime? | |
| internshipType | Enum ONSITE/REMOTE | |
| status | Enum DRAFT/PUBLISHED/ARCHIVED | |
| internshipDetail | String? | rich text |
| roleOverview | String? | rich text |
| keyResponsibilities | String? | rich text |
| eligibilityRequirements | String? | rich text |
| timelineWorkSchedule | String? | rich text |
| perksAndBenefits | String? | rich text |
| selectionProcess | String? | rich text |
| contactInformation | String? | rich text |
| screeningQuestions | Json? | `[{question, expectedAnswer}]` |
| eligibilityCheck | Json? | `{minClubPoints, minProjects, minInternships, minClubCertification}` |
| assessments | Json? | `[{pdfUrl, minScore, weightage}]` |
| interviewRubric | Json? | `{pdfUrl, minScore, weightage}` |
| offerLetterTemplateUrl | String? | |
| termsConditionUrl | String? | |
| offerLetterReleaseMethod | String? | |
| functionalGroupId | BigInt? | FK to functional_groups |
| preInternshipCommunication | String? | rich text |
| preReadCourses | Json? | `[{pdfUrl, name}]` |
| preReadArticles | Json? | `[{pdfUrl, name}]` |
| totalWeeks | Int? | |
| weeklySchedule | Json? | `[{functionalGroupId, capabilityInstanceId, coordinatorUserId, noOfWeeks, tasks:[{title, evidence}]}]` |
| midTermFeedbackDate | DateTime? | |
| finalSubmissionDocuments | Json? | `["Report","Presentation",...]` |
| documentGuidelines | String? | rich text |
| presentationRubricUrl | String? | |
| minPresentationScore | Decimal? | percentage |
| presentationWeightage | Decimal? | percentage |
| certificateTemplateUrl | String? | |
| createdBy | BigInt | |
| createdOn | DateTime default now() | |
| updatedOn | DateTime updatedAt | |

### `InternshipBatch` (`@@map("internship_batches")`)
| Field | Type | Notes |
|---|---|---|
| id | BigInt PK | |
| internshipId | BigInt FK | |
| batchSize | Int | |
| coordinatorUserId | BigInt? | user FK |
| createdOn | DateTime | |

---

## 2. Domain Layer (`libs/contexts/internship-hiring/src/`)

- `domain/aggregates/internship.aggregate.ts` — Internship class with create(), update(), publish(), archive()
- `domain/value-objects/internship-type.vo.ts` — enum ONSITE | REMOTE
- `domain/value-objects/internship-status.vo.ts` — enum DRAFT | PUBLISHED | ARCHIVED
- `domain/repositories/internship.repository.ts` — IInternshipRepository interface
- `domain/exceptions/internship-not-found.exception.ts`

---

## 3. Application Layer

Commands: Create, Update, Publish, Archive, UploadInternshipFile
Queries: ListInternships, GetInternshipById
DTOs: InternshipListItemDto, InternshipDetailDto, CreateInternshipDto, UpdateInternshipDto

---

## 4. Infrastructure Layer

- `infrastructure/persistence/postgres/prisma-internship.repository.ts`

---

## 5. API Layer

### Core API (`apps/api/core-api/src/modules/internship-hiring/`)
Routes:
- GET /api/internships
- POST /api/internships
- GET /api/internships/cities
- GET /api/internships/functional-groups
- GET /api/internships/users
- POST /api/internships/files/upload
- GET /api/internships/:id
- PUT /api/internships/:id
- POST /api/internships/:id/publish
- POST /api/internships/:id/archive

### BFF (`apps/api/bff/src/modules/internship-hiring/`)
Proxy all routes with prefix `/internships`

---

## 6. Frontend (`apps/web/admin-portal/src/app/pages/manage-internship/`)

- `ManageInternshipComponent` — page shell, modes: list | create | edit
- `internship-list-panel/` — left sidebar 320px, internship cards
- `internship-detail-panel/` — right panel read-only 5-tab view
- `assessment-library-panel/` — left panel in create/edit mode (mocked)
- `internship-form/` — right panel create/edit, 5 tab sections:
  - `details-tab/`
  - `screening-criteria-tab/`
  - `selection-tab/`
  - `during-internship-tab/`
  - `final-submission-tab/`
- `models/manage-internship.models.ts`
- `services/manage-internship-api.service.ts`

Route: `/manage-internship`
