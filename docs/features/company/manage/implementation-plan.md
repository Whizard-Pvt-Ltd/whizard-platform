# Implementation Plan: Manage Company

## 1. Data Model — Prisma Schema

### New Models

| Model | Table | Notes |
|---|---|---|
| `Tenant` | `tenants` | Master — type: COMPANY\|COLLEGE. All companies & colleges are tenants |
| `Company` | `companies` | Core aggregate — `tenantId` FK + `industryId` FK to existing `Industry`. Status 0=Draft, 1=Published |
| `CompanyClub` | `clubs_companies` | M:N mapping (alphabetical). `isParent` flag distinguishes parent club vs associated club |
| `CompanyMediaAsset` | `companies_media_assets` | M:N. mediaRole: logo\|brochure\|promotional_video\|gallery\|testimonial |
| `CompanyContact` | `company_contacts` | Company → User with contactRole: HR_COORDINATOR\|COMMUNICATION_COORDINATOR\|RECRUITMENT_HEAD\|TRAINING_COORDINATOR\|INTERNSHIP_MENTOR |
| `CompanyService` | `company_services` | "What We Offer" — category + description |
| `CompanyProduct` | `company_products` | "Key Products & Services" — name + description |
| `CompanyHiringStat` | `company_hiring_stats` | Yearly hiring data — hires, internship conversion rate |
| `CompanyHiringRole` | `company_hiring_roles` | Top roles hired |
| `CompanyHiringDomain` | `company_hiring_domains` | Hiring domains |
| `CompanyCompensationStat` | `company_compensation_stats` | highest/average package by year |

All models include `createdBy`, `updatedBy?`, `createdOn`, `updatedOn?`, `isActive`.

### Modified Existing Models

| Model | Change |
|---|---|
| `FunctionalGroup`, `CapabilityInstance`, `ControlPoint`, `PrimaryWorkObject`, `SecondaryWorkObject`, `Skill`, `Task`, `Department`, `DepartmentFunctionalGroup`, `Role`, `Club`, `College`, `MediaAsset` | Add `tenant Tenant @relation(...)` FK — bare `tenantId: String` becomes a proper FK |
| `Industry` | Add `companies Company[]` back-relation |
| `Club` | Add `companies CompanyClub[]` back-relation |
| `MediaAsset` | Add `companies CompanyMediaAsset[]` back-relation |

### Explicitly Out of Scope
- No `CompanyDepartment` table — WRCF `Department` reused at runtime via `industryId` filter
- No `CompanyUserProfile` — future feature
- No provisioning/copy step — WRCF data consolidated at runtime by `industryId`

### Seed (`prisma/seed/company-organization.seed.ts`)
- `Tenant` records for all existing college/club seed data (satisfy new FK constraint)
- 5 sample companies (TCS, TechNova, HDFC, Bharti Airtel, Amazon) each with a Tenant record
- Users for each contact role

---

## 2. Shared Infrastructure — S3 & UI

All already exist — no changes needed:
- `libs/shared/infrastructure/src/s3storage/`
- `libs/shared/ui/src/quill-editor/`
- `libs/shared/ui/src/pdf-viewer/`
- `libs/shared/ui/src/media-uploader/`

---

## 3. Domain Layer — `libs/contexts/company-organization/src/domain/`

**Aggregate:** `Company` — `create()`, `update()`, `publish()`, `addMedia()`, `removeMedia()`, `setContact()`

**Value Objects:**
- `CompanyStatus` — Draft (0) | Published (1)
- `MediaRole` — logo | brochure | promotional_video | gallery | testimonial
- `ContactRole` — HR_COORDINATOR | COMMUNICATION_COORDINATOR | RECRUITMENT_HEAD | TRAINING_COORDINATOR | INTERNSHIP_MENTOR

**Repository Interfaces:**
- `ICompanyRepository` — `findById`, `findAll(tenantId, search?)`, `save`, `existsByName`

---

## 4. Application Layer — `libs/contexts/company-organization/src/application/`

### Commands + Handlers

| Command | Handler | Description |
|---|---|---|
| `CreateCompanyCommand` | `CreateCompanyCommandHandler` | Creates Tenant + Company in one transaction |
| `UpdateCompanyCommand` | `UpdateCompanyCommandHandler` | Updates all fields, media, clubs, contacts, services, products, stats |
| `PublishCompanyCommand` | `PublishCompanyCommandHandler` | Draft → Published |
| `UploadMediaAssetCommand` | `UploadMediaAssetCommandHandler` | Upload to S3, save `media_assets` record (reuses shared `IStoragePort`) |

### Queries + Handlers

| Query | Description |
|---|---|
| `ListCompaniesQuery` | Paginated list with optional search |
| `GetCompanyByIdQuery` | Full detail — contacts, clubs, media, services, products, stats |
| `ListClubsQuery` | All clubs |
| `ListIndustriesQuery` | All industries grouped by sector |
| `ListUsersForContactsQuery` | Users for contact role dropdowns |
| `ListCitiesQuery` | All cities for Location dropdown |

**DTOs:** `CompanyListItemDto`, `CompanyDetailDto`, `CompanyContactDto`, `MediaAssetDto`, `ClubDto`, `IndustryDto`

---

## 5. Infrastructure Layer

`PrismaCompanyRepository` — `findAll` with full `include` (contacts, clubs, mediaAssets, services, products, hiringStats, hiringRoles, hiringDomains, compensationStats)

---

## 6. Core API — `apps/api/core-api/src/modules/company-organization/`

| Method | URL | Handler |
|---|---|---|
| GET | `/companies` | `listCompanies` |
| POST | `/companies` | `createCompany` |
| GET | `/companies/:id` | `getCompanyById` |
| PUT | `/companies/:id` | `updateCompany` |
| POST | `/companies/:id/publish` | `publishCompany` |
| GET | `/companies/clubs` | `listClubs` |
| GET | `/companies/industries` | `listIndustries` |
| GET | `/companies/users` | `listUsersForContacts` |
| GET | `/companies/cities` | `listCities` |
| POST | `/companies/media-assets/upload` | `uploadMediaAsset` (multipart) |

Guarded with `authorizationPreHandler('COMPANY.MANAGE')`.

Files: `routes.ts`, `runtime.ts`, `company-organization.module.ts`

---

## 7. BFF — `apps/api/bff/src/modules/company-organization/`

Proxies all 10 routes at `/api/companies/...`.

Files: `routes.ts`, `company-organization.bff.module.ts`

---

## 8. Frontend — `apps/web/admin-portal/src/app/pages/manage-company/`

Route: `/manage-company`

### Component Structure
```
manage-company/
  manage-company.component.ts/html/css
  components/
    company-list-panel/
    company-detail-panel/
    company-form/
    company-preview/
    media-library-panel/
  models/manage-company.models.ts
  services/manage-company-api.service.ts
```

### View Mode (list + detail)
- Header: `Manage Company` title + `+ Add` button (top-right, bg `action`)
- Filter tabs: Club | Project | Job | Internship | Mentor | College | **Company** (active) | Event | Student Profile | All Filters
- Left panel: company cards (logo, name, Company ID, location, established year, type)
- Right panel scrollable: header → about → brochure → promo videos → gallery → what we offer → awards → key products → key contacts → recruitment highlights → employee testimonials → placement & career development

### Edit Mode (media library + form)
- Top bar: Preview | Save (Draft) | Send to Publish (enabled when mandatory fields filled)
- Left panel: media library (images/videos)
- Right panel: Details tab form — logo upload, name*, industry*, location*, established year, type, parent club, associated club, description (Quill), brochure (PDF upload), promo videos (grid+upload), gallery (grid+upload), what we offer (Quill), awards (Quill), key products (Quill), contacts (5 role dropdowns), recruitment highlights, employee testimonials (video upload), placement stats

### State
- Signals: `mode`, `selectedCompanyId`, `companies`, `loading`, `formDirty`
- `FormBuilder` for typed fields; file/media as raw `File[]` signals outside FormBuilder

---

## 9. Files to Create / Modify

### New Files
- `docs/features/company/manage/implementation-plan.md`
- `prisma/seed/company-organization.seed.ts`
- `libs/contexts/company-organization/src/domain/aggregates/company.aggregate.ts`
- `libs/contexts/company-organization/src/domain/value-objects/company-status.vo.ts`
- `libs/contexts/company-organization/src/domain/value-objects/media-role.vo.ts`
- `libs/contexts/company-organization/src/domain/value-objects/contact-role.vo.ts`
- `libs/contexts/company-organization/src/domain/repositories/company.repository.ts`
- `libs/contexts/company-organization/src/application/commands/create-company.command.ts`
- `libs/contexts/company-organization/src/application/commands/update-company.command.ts`
- `libs/contexts/company-organization/src/application/commands/publish-company.command.ts`
- `libs/contexts/company-organization/src/application/commands/upload-media-asset.command.ts`
- `libs/contexts/company-organization/src/application/command-handlers/create-company.handler.ts`
- `libs/contexts/company-organization/src/application/command-handlers/update-company.handler.ts`
- `libs/contexts/company-organization/src/application/command-handlers/publish-company.handler.ts`
- `libs/contexts/company-organization/src/application/command-handlers/upload-media-asset.handler.ts`
- `libs/contexts/company-organization/src/application/queries/list-companies.query.ts`
- `libs/contexts/company-organization/src/application/queries/get-company-by-id.query.ts`
- `libs/contexts/company-organization/src/application/queries/list-clubs.query.ts`
- `libs/contexts/company-organization/src/application/queries/list-industries.query.ts`
- `libs/contexts/company-organization/src/application/queries/list-users-for-contacts.query.ts`
- `libs/contexts/company-organization/src/application/queries/list-cities.query.ts`
- `libs/contexts/company-organization/src/application/query-handlers/list-companies.handler.ts`
- `libs/contexts/company-organization/src/application/query-handlers/get-company-by-id.handler.ts`
- `libs/contexts/company-organization/src/application/query-handlers/list-clubs.handler.ts`
- `libs/contexts/company-organization/src/application/query-handlers/list-industries.handler.ts`
- `libs/contexts/company-organization/src/application/query-handlers/list-users-for-contacts.handler.ts`
- `libs/contexts/company-organization/src/application/query-handlers/list-cities.handler.ts`
- `libs/contexts/company-organization/src/application/dto/company.dto.ts`
- `libs/contexts/company-organization/src/application/ports/storage/storage.port.ts`
- `libs/contexts/company-organization/src/infrastructure/persistence/postgres/repositories/prisma-company.repository.ts`
- `apps/api/core-api/src/modules/company-organization/routes.ts`
- `apps/api/core-api/src/modules/company-organization/runtime.ts`
- `apps/api/core-api/src/modules/company-organization/company-organization.module.ts`
- `apps/api/bff/src/modules/company-organization/routes.ts`
- `apps/api/bff/src/modules/company-organization/company-organization.bff.module.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/manage-company.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/manage-company.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/manage-company.component.css`
- `apps/web/admin-portal/src/app/pages/manage-company/models/manage-company.models.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/services/manage-company-api.service.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-list-panel/company-list-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-list-panel/company-list-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-list-panel/company-list-panel.component.css`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-detail-panel/company-detail-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-detail-panel/company-detail-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-detail-panel/company-detail-panel.component.css`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-form/company-form.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-form/company-form.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-form/company-form.component.css`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-preview/company-preview.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-preview/company-preview.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/components/company-preview/company-preview.component.css`
- `apps/web/admin-portal/src/app/pages/manage-company/components/media-library-panel/media-library-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-company/components/media-library-panel/media-library-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-company/components/media-library-panel/media-library-panel.component.css`

### Modified Files
- `prisma/schema.prisma`
- `apps/api/core-api/src/server.ts`
- `apps/api/bff/src/server.ts`
- `apps/web/admin-portal/src/app/app.routes.ts`
- `apps/web/admin-portal/src/app/shared/nav-drawer/nav-drawer.component.html`
- `libs/contexts/company-organization/src/index.ts`
