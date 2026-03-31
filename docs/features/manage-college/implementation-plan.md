# Implementation Plan: Manage College

## 1. Data Model — Prisma Schema

New models in `prisma/schema.prisma`:

| Model                     | Table                        | Notes                                                              |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `City`                  | `cities`                   | Master — seed data (20 default Indian cities)                     |
| `Club`                  | `clubs`                    | Master — seed data                                                |
| `DegreeProgram`         | `degree_programs`          | Master — seed data                                                |
| `ProgramSpecialization` | `program_specializations`  | Master — linked to degree_programs                                |
| `MediaAsset`            | `media_assets`             | Master — S3 URLs, type: image/video/pdf                           |
| `College`               | `colleges`                 | Core aggregate — status 0=Draft, 1=Published                      |
| `CollegeContact`        | `college_contacts`         | College ↔ User with role enum Seed data                           |
| `CollegeClub`           | `clubs_colleges`           | M:N mapping (alphabetical)                                         |
| `CollegeMediaAsset`     | `colleges_media_assets`    | M:N with mediaRole: logo/brochure/promotional_video/campus_gallery |
| `CollegeDegreeProgram`  | `colleges_degree_programs` | M:N mapping college ↔ degree program                              |

All models get `createdBy`, `createdOn`, `updatedBy?`, `updatedOn?`, `isActive`, `tenantId` (where applicable).

**Migration**: 1 new migration + seed data for clubs, degree_programs, program_specializations, users with college contact roles, and cities.

**Seed cities** (`cities` table → `@@map("cities")`): Used as the `Location` dropdown on the college form.

| #  | City          | State          |
| -- | ------------- | -------------- |
| 1  | Mumbai        | Maharashtra    |
| 2  | Delhi         | Delhi          |
| 3  | Bengaluru     | Karnataka      |
| 4  | Hyderabad     | Telangana      |
| 5  | Chennai       | Tamil Nadu     |
| 6  | Pune          | Maharashtra    |
| 7  | Kolkata       | West Bengal    |
| 8  | Ahmedabad     | Gujarat        |
| 9  | Jaipur        | Rajasthan      |
| 10 | Lucknow       | Uttar Pradesh  |
| 11 | Chandigarh    | Punjab         |
| 12 | Bhopal        | Madhya Pradesh |
| 13 | Indore        | Madhya Pradesh |
| 14 | Nagpur        | Maharashtra    |
| 15 | Coimbatore    | Tamil Nadu     |
| 16 | Kochi         | Kerala         |
| 17 | Visakhapatnam | Andhra Pradesh |
| 18 | Surat         | Gujarat        |
| 19 | Patna         | Bihar          |
| 20 | Bhubaneswar   | Odisha         |

**Design note**: `degree_programs` treated as global master data (no `college_id`). Colleges select from shared catalog via `colleges_degree_programs` mapping.

**Seed users**: Create sample users pre-assigned to the following contact roles for seeding `college_contacts`:

| Role Enum                 | Display Name          |
| ------------------------- | --------------------- |
| `VICE_CHANCELLOR`       | Vice Chancellor       |
| `PLACEMENT_HEAD`        | Placement Head        |
| `COORDINATOR`           | Coordinator           |
| `PLACEMENT_COORDINATOR` | Placement Coordinator |
| `GROOM_COORDINATOR`     | Groom Coordinator     |

These users will be seeded into the existing `user_accounts` table (or equivalent) and made available in the contact role dropdowns.

---

## 2. Shared Infrastructure — S3 Storage

**New files in `libs/shared/infrastructure/src/s3storage/`:**

- `storage.port.ts` — `IStoragePort` interface: `upload(file, key, contentType): Promise<{ url, key }>`
- `s3-storage.adapter.ts` — implements `IStoragePort` using AWS SDK v3 (`@aws-sdk/client-s3`)
- Config via env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
- Export from `libs/shared/infrastructure/src/index.ts`

---

## 3. Theme & Icon Constants

All Angular components in this feature **must** use the following libraries. No raw hex values or inline SVG icons are permitted.

### Theme — `@whizard/theme`

Import alias: `@whizard/theme`

| Export                | Usage                                                            |
| --------------------- | ---------------------------------------------------------------- |
| `provideTheming()`  | Already registered in `app.config.ts` — no change needed      |
| `ThemingService`    | Inject if programmatic scheme switching is needed                |
| CSS custom properties | Use WRCF design system tokens via Tailwind utilities (see below) |

**Tailwind CSS token usage** — all colours must reference WRCF tokens, not raw hex:

| Token                          | Tailwind class                          | Usage in this feature                  |
| ------------------------------ | --------------------------------------- | -------------------------------------- |
| `bg.primary` `#0F172A`     | `bg-[var(--wrcf-bg-primary)]`         | Page background, header                |
| `bg.secondary` `#0F253F`   | `bg-[var(--wrcf-bg-secondary)]`       | Filter bar, list panel                 |
| `bg.card` `#1E293B`        | `bg-[var(--wrcf-bg-card)]`            | College list cards, detail panel       |
| `bg.selected` `#2D2A5A`    | `bg-[var(--wrcf-bg-selected)]`        | Selected college card                  |
| `text.primary` `#E8F0FA`   | `text-[var(--wrcf-text-primary)]`     | College name, body text                |
| `text.secondary` `#7F94AE` | `text-[var(--wrcf-text-secondary)]`   | Metadata (ID, year, type)              |
| `text.tertiary` `#8AB4F8`  | `text-[var(--wrcf-text-tertiary)]`    | College code, links                    |
| `border` `#484E5D`         | `border-[var(--wrcf-border)]`         | All borders, dividers                  |
| `action` `#314DDF`         | `bg-[var(--wrcf-action)]`             | Primary buttons, panel headers         |
| `action.hover` `#263FCC`   | `hover:bg-[var(--wrcf-action-hover)]` | Button hover state                     |
| `accent` `#00BFFF`         | `border-l-[var(--wrcf-accent)]`       | Selected card left border, focus rings |

### Icons — `@whizard/icons`

Import alias: `@whizard/icons`

`provideIcons()` is already registered globally. Use `<mat-icon svgIcon="namespace:name">` in all templates.

| Namespace              | Size          | Usage in this feature                       |
| ---------------------- | ------------- | ------------------------------------------- |
| `heroicons_outline:` | 24×24 stroke | Search, edit, add, location, calendar icons |
| `heroicons_solid:`   | 24×24 fill   | Status indicators, filled state icons       |
| `heroicons_mini:`    | 20×20 fill   | Compact inline icons (badges, tags)         |
| `lucideIcons:`       | 24×24        | Upload, file, video, image icons            |

**Common icons for this feature:**

| Icon     | Namespace:name                         | Used for                   |
| -------- | -------------------------------------- | -------------------------- |
| Search   | `heroicons_outline:magnifying-glass` | Search bar                 |
| Add      | `heroicons_outline:plus`             | Add button, media grid "+" |
| Edit     | `heroicons_outline:pencil-square`    | Edit button                |
| Location | `heroicons_outline:map-pin`          | College location           |
| Calendar | `heroicons_outline:calendar`         | Established year           |
| Upload   | `lucideIcons:upload`                 | Upload area                |
| File PDF | `lucideIcons:file-text`              | Brochure                   |
| Video    | `lucideIcons:video`                  | Promotional video          |
| Image    | `lucideIcons:image`                  | Gallery                    |
| Club     | `heroicons_outline:user-group`       | Club chapters              |
| Eye      | `heroicons_outline:eye`              | Preview button             |
| Check    | `heroicons_solid:check-circle`       | Published status           |
| Globe    | `heroicons_outline:globe-alt`        | Affiliated university      |

---

## 4. Shared UI Library Additions (New Components)

**New components in `libs/shared/ui/src/`:**

| Component           | Purpose                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `quill-editor/`   | Standalone Angular wrapper for Quill.js — dark-theme config (Bold, Lists, Formatting). Reusable across the app. |
| `pdf-viewer/`     | Iframe-based PDF viewer component.                                                                               |
| `media-uploader/` | Drag-and-drop + click-to-upload. Emits `File`, validates 2MB max size.                                         |

Export all from `libs/shared/ui/src/index.ts`.

---

## 4. Domain Layer — `libs/contexts/college-operations/src/domain/`

**Aggregate:**

- `College` — `create()`, `update()`, `publish()`, `addMedia()`, `removeMedia()`, `setContact()`

**Value Objects:**

- `CollegeStatus` — Draft (0) | Published (1)
- `MediaRole` — logo | brochure | promotional_video | campus_gallery
- `ContactRole` — VICE_CHANCELLOR | GROOM_COORDINATOR | COORDINATOR | PLACEMENT_HEAD | PLACEMENT_COORDINATOR

**Repository Interfaces:**

- `ICollegeRepository` — `findById`, `findAll(tenantId, search?)`, `save`, `existsByName`
- `IClubRepository` — `findAll(tenantId)`
- `IMediaAssetRepository` — `findById`, `findByTenant(tenantId, type?)`, `save`
- `IDegreeProggramRepository` — `findAll()`

**Port:**

- `IStoragePort` re-exported in `application/ports/storage.port.ts`

---

## 5. Application Layer — `libs/contexts/college-operations/src/application/`

### Commands + Handlers

| Command                     | Handler                            | Description                                     |
| --------------------------- | ---------------------------------- | ----------------------------------------------- |
| `CreateCollegeCommand`    | `CreateCollegeCommandHandler`    | Draft a new college                             |
| `UpdateCollegeCommand`    | `UpdateCollegeCommandHandler`    | Update college fields, media, clubs, contacts   |
| `PublishCollegeCommand`   | `PublishCollegeCommandHandler`   | Change status Draft → Published                |
| `UploadMediaAssetCommand` | `UploadMediaAssetCommandHandler` | Upload file to S3, save `media_assets` record |

### Queries + Handlers

| Query                         | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `ListCollegesQuery`         | Paginated list with optional search          |
| `GetCollegeByIdQuery`       | Full detail including contacts, clubs, media |
| `ListClubsQuery`            | All clubs for multi-select dropdown          |
| `ListDegreeProgramsQuery`   | All programs + specializations               |
| `ListMediaAssetsQuery`      | Tenant media library filtered by type        |
| `ListUsersForContactsQuery` | Users for contact role dropdowns             |
| `ListCitiesQuery`           | All cities for Location dropdown             |

### DTOs

`CollegeListItemDto`, `CollegeDetailDto`, `MediaAssetDto`, `ClubDto`, `DegreeProgramDto`, `ProgramSpecializationDto`

---

## 6. Infrastructure Layer — `libs/contexts/college-operations/src/infrastructure/`

**Prisma Repositories:**

- `PrismaCollegeRepository` — `findAll` with `include: { contacts, clubs, mediaAssets }`
- `PrismaClubRepository`
- `PrismaMediaAssetRepository`
- `PrismaDegreeProgramRepository`

---

## 7. Core API Module — `apps/api/core-api/src/modules/college-operations/`

### Routes (`routes.ts`)

| Method   | URL                               | Handler                          |
| -------- | --------------------------------- | -------------------------------- |
| `GET`  | `/colleges`                     | `listColleges`                 |
| `POST` | `/colleges`                     | `createCollege`                |
| `GET`  | `/colleges/:id`                 | `getCollegeById`               |
| `PUT`  | `/colleges/:id`                 | `updateCollege`                |
| `POST` | `/colleges/:id/publish`         | `publishCollege`               |
| `GET`  | `/colleges/clubs`               | `listClubs`                    |
| `GET`  | `/colleges/degree-programs`     | `listDegreePrograms`           |
| `GET`  | `/colleges/media-assets`        | `listMediaAssets`              |
| `POST` | `/colleges/media-assets/upload` | `uploadMediaAsset` (multipart) |
| `GET`  | `/colleges/users`               | `listUsersForContacts`         |
| `GET`  | `/colleges/cities`              | `listCities`                   |

All routes guarded with `authorizationPreHandler('COLLEGE.MANAGE')`.

### Files

- `routes.ts` — Fastify route definitions
- `runtime.ts` — wires Prisma repos + `S3StorageAdapter` → handlers
- `college-operations.module.ts` — registers module with Fastify app

Register in `apps/api/core-api/src/server.ts`.

---

## 8. BFF Module — `apps/api/bff/src/modules/college-operations/`

Proxy all 10 Core API routes through BFF at `/api/colleges/...`.

- `routes.ts` — proxy route definitions
- `college-operations.bff.module.ts` — module registration

Register in `apps/api/bff/src/server.ts`.

---

## 9. Frontend — Angular Admin Portal

**Route**: `/manage-college` in `apps/web/admin-portal/src/app/app.routes.ts`

### Folder Structure

```
apps/web/admin-portal/src/app/pages/manage-college/
  manage-college.component.ts/html/css         ← Page shell — toggles between view and edit mode
  components/
    college-list-panel/                         ← Left panel: search, filter tabs, college cards
    college-detail-panel/                       ← Right panel: read-only scrollable detail view
    college-form/                               ← Create/Edit form (right panel in edit mode)
    college-preview/                            ← Preview mode component
    media-library-panel/                        ← Left panel in edit mode (Images/Videos picker)
  models/
    manage-college.models.ts
  services/
    manage-college-api.service.ts
```

### Layout Modes (toggled by `mode` signal)

1. **View mode** — left college list panel + right detail panel
2. **Edit/Create mode** — left media library panel + right tabbed form

### Form Sections (right panel, edit mode)

- College Details: thumbnail upload, name, affiliated university (dropdown), location (dropdown), established year, college type (dropdown)
- College description — Quill editor
- College Brochure — single PDF upload (max 2MB, drag-and-drop)
- Promotional Videos — grid + upload (max 2MB each)
- Campus Gallery — grid + upload (max 2MB each)
- Local Club Chapters — multi-select dropdown
- Degrees Offered — Quill editor
- College Key Contacts — 5 role dropdowns (Vice Chancellor, Groom Coordinator, Communication Coordinator, Placement Head, Placement Coordinator)
- Inquiry email — text field
- Placement Highlights — Quill editor

### Top Bar (edit mode)

- **Preview** button — opens preview mode
- **Save** button — saves as Draft (status 0)
- **Send to Publish** button — enabled only when all mandatory fields are filled (status 1)

### State Management

- Signals for: `mode`, `selectedCollegeId`, `colleges`, `loading`, `formDirty`
- `FormBuilder` for all typed form fields
- Upload fields managed outside FormBuilder (raw `File` signals)

---

## 10. Files to Create / Modify

### New Files

**Prisma / Seed**

- `prisma/seed/college-operations.seed.ts`

**Shared Infrastructure**

- `libs/shared/infrastructure/src/s3storage/storage.port.ts`
- `libs/shared/infrastructure/src/s3storage/s3-storage.adapter.ts`

**Shared UI**

- `libs/shared/ui/src/quill-editor/quill-editor.component.ts`
- `libs/shared/ui/src/quill-editor/quill-editor.component.html`
- `libs/shared/ui/src/pdf-viewer/pdf-viewer.component.ts`
- `libs/shared/ui/src/pdf-viewer/pdf-viewer.component.html`
- `libs/shared/ui/src/media-uploader/media-uploader.component.ts`
- `libs/shared/ui/src/media-uploader/media-uploader.component.html`

**Domain Layer**

- `libs/contexts/college-operations/src/domain/aggregates/college.aggregate.ts`
- `libs/contexts/college-operations/src/domain/value-objects/college-status.vo.ts`
- `libs/contexts/college-operations/src/domain/value-objects/media-role.vo.ts`
- `libs/contexts/college-operations/src/domain/value-objects/contact-role.vo.ts`
- `libs/contexts/college-operations/src/domain/repositories/college.repository.ts`
- `libs/contexts/college-operations/src/domain/repositories/club.repository.ts`
- `libs/contexts/college-operations/src/domain/repositories/media-asset.repository.ts`
- `libs/contexts/college-operations/src/domain/repositories/degree-program.repository.ts`

**Application Layer**

- `libs/contexts/college-operations/src/application/commands/create-college.command.ts`
- `libs/contexts/college-operations/src/application/commands/update-college.command.ts`
- `libs/contexts/college-operations/src/application/commands/publish-college.command.ts`
- `libs/contexts/college-operations/src/application/commands/upload-media-asset.command.ts`
- `libs/contexts/college-operations/src/application/command-handlers/create-college.handler.ts`
- `libs/contexts/college-operations/src/application/command-handlers/update-college.handler.ts`
- `libs/contexts/college-operations/src/application/command-handlers/publish-college.handler.ts`
- `libs/contexts/college-operations/src/application/command-handlers/upload-media-asset.handler.ts`
- `libs/contexts/college-operations/src/application/queries/list-colleges.query.ts`
- `libs/contexts/college-operations/src/application/queries/get-college-by-id.query.ts`
- `libs/contexts/college-operations/src/application/queries/list-clubs.query.ts`
- `libs/contexts/college-operations/src/application/queries/list-degree-programs.query.ts`
- `libs/contexts/college-operations/src/application/queries/list-media-assets.query.ts`
- `libs/contexts/college-operations/src/application/queries/list-users-for-contacts.query.ts`
- `libs/contexts/college-operations/src/application/query-handlers/list-colleges.handler.ts`
- `libs/contexts/college-operations/src/application/query-handlers/get-college-by-id.handler.ts`
- `libs/contexts/college-operations/src/application/query-handlers/list-clubs.handler.ts`
- `libs/contexts/college-operations/src/application/query-handlers/list-degree-programs.handler.ts`
- `libs/contexts/college-operations/src/application/query-handlers/list-media-assets.handler.ts`
- `libs/contexts/college-operations/src/application/query-handlers/list-users-for-contacts.handler.ts`
- `libs/contexts/college-operations/src/application/dtos/college.dto.ts`
- `libs/contexts/college-operations/src/application/ports/storage.port.ts`

**Infrastructure Layer**

- `libs/contexts/college-operations/src/infrastructure/persistence/postgres/repositories/prisma-college.repository.ts`
- `libs/contexts/college-operations/src/infrastructure/persistence/postgres/repositories/prisma-club.repository.ts`
- `libs/contexts/college-operations/src/infrastructure/persistence/postgres/repositories/prisma-media-asset.repository.ts`
- `libs/contexts/college-operations/src/infrastructure/persistence/postgres/repositories/prisma-degree-program.repository.ts`

**Core API**

- `apps/api/core-api/src/modules/college-operations/routes.ts`
- `apps/api/core-api/src/modules/college-operations/runtime.ts`
- `apps/api/core-api/src/modules/college-operations/college-operations.module.ts`

**BFF**

- `apps/api/bff/src/modules/college-operations/routes.ts`
- `apps/api/bff/src/modules/college-operations/college-operations.bff.module.ts`

**Frontend**

- `apps/web/admin-portal/src/app/pages/manage-college/manage-college.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/manage-college.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/manage-college.component.css`
- `apps/web/admin-portal/src/app/pages/manage-college/models/manage-college.models.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/services/manage-college-api.service.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-list-panel/college-list-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-list-panel/college-list-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-list-panel/college-list-panel.component.css`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-detail-panel/college-detail-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-detail-panel/college-detail-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-detail-panel/college-detail-panel.component.css`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-form/college-form.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-form/college-form.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-form/college-form.component.css`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-preview/college-preview.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-preview/college-preview.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/components/college-preview/college-preview.component.css`
- `apps/web/admin-portal/src/app/pages/manage-college/components/media-library-panel/media-library-panel.component.ts`
- `apps/web/admin-portal/src/app/pages/manage-college/components/media-library-panel/media-library-panel.component.html`
- `apps/web/admin-portal/src/app/pages/manage-college/components/media-library-panel/media-library-panel.component.css`

### Modified Files

- `prisma/schema.prisma` — add 9 new models
- `apps/api/core-api/src/server.ts` — register college-operations module
- `apps/api/bff/src/server.ts` — register college-operations BFF module
- `apps/web/admin-portal/src/app/app.routes.ts` — add `/manage-college` route
- `apps/web/admin-portal/src/app/shared/nav-drawer/nav-drawer.component.html` — add College section with Manage College link (`heroicons_outline:academic-cap`)
- `libs/shared/infrastructure/src/index.ts` — export S3 adapter + port
- `libs/shared/ui/src/index.ts` — export new UI components
- `libs/contexts/college-operations/src/index.ts` — export public API
