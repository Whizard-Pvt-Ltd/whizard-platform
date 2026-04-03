# Manage College Enhancement — Implementation Plan

## 1. DB — Add `cityCode` to City

**`prisma/schema.prisma`**
- Add `cityCode String? @map("city_code")` to `model City`

**`prisma/seeds/college-operations.seed.ts`**
- Add `cityCode` (4 uppercase chars) to each city: e.g. `BLOR`, `MUMR`, `DELH`, `HYDD`, `AHDM`, etc.
- Update upsert to include `cityCode`

**Migration**
- Run `pnpm prisma:migrate:dev`

---

## 2. Backend — College Code Generation

Change format from `{CITYNAME}-{YEAR}-{RANDOM8}` → `CLG-{YEAR}-{CITYCODE}-{SEQ3}`  
(matches screenshot-ui-2: `CLG-2025-BLR-002`)

**Files:**
- `libs/contexts/college-operations/src/domain/aggregates/college.aggregate.ts`  
  - `create()`: accept `cityCode` instead of `cityName`; generate `CLG-${year}-${cityCode}-${seq3}`
- `libs/contexts/college-operations/src/application/commands/create-college.command.ts`  
  - Add `cityCode?: string`
- `libs/contexts/college-operations/src/application/command-handlers/create-college.handler.ts`  
  - Fetch `city.cityCode` from Prisma using `cmd.cityId`, pass to `College.create()`

---

## 3. Backend — Fix Key Contacts Showing userId Instead of Name

**Root cause:** `GetCollegeByIdQueryHandler` calls `toCollegeDetailDto(college, null)`;  
mapper maps contacts as `{ userId, role }` — no `userName`.  
Also passes `null` for `cityName`.

**`libs/contexts/college-operations/src/application/query-handlers/get-college-by-id.handler.ts`**
- After fetching college, query `UserAccount` for contact userIds via `getPrisma()`
- Build `userMap: Map<string, { displayName, email }>`
- Fetch `city.name` using `college.cityId`
- Pass both to enriched `toCollegeDetailDto`

**`libs/contexts/college-operations/src/application/mappers/college.mapper.ts`**
- Accept optional `userMap` and `cityName` params in `toCollegeDetailDto`
- Enrich each contact with `userName` and `userEmail`

---

## 4. Frontend — Move Search to Left Panel

**Root cause:** Search input is in the page header; screenshot-ui-2 shows it inside the left panel.

**`manage-college.component.html`**
- Remove the search `<div>` (lines 22–30) from the header
- Keep filter chips and Add button in header

**`manage-college.component.ts`**
- Remove `searchQuery` signal (move to list panel)
- Remove `[searchQuery]` input binding from `<whizard-college-list-panel>`

**`college-list-panel.component.html`**
- Add search input at top of the panel (before the college list)
- Increase panel width: `w-[260px] min-w-[260px]` → `w-[320px] min-w-[320px]`

**`college-list-panel.component.ts`**
- `searchQuery` signal already lives here — just remove the `@Input()` binding

---

## 5. Frontend — Edit Button Fix

**`college-detail-panel.component.html`** (line 22)
- Change `mat-button` → `mat-flat-button` (icon `heroicons_outline:pencil-square` already present)

Apply `mat-flat-button` consistently to all action buttons in edit/create/preview mode in  
**`manage-college.component.html`** (lines 66–90).

---

## 6. Frontend — Add Back Button in Edit/Create Screen

**`manage-college.component.html`** — in edit/create action bar (before Preview/Save buttons):
```html
<button type="button" (click)="onBackClicked()" ...>
  <mat-icon svgIcon="heroicons_outline:arrow-left" /> Back
</button>
```

**`manage-college.component.ts`**
- Add `onBackClicked()` → `mode.set('list')`

---

## 7. Frontend — Fix Logo Upload (Click Not Wired)

**Root cause:** Circle button in `college-form.component.html` has no click handler; the  
`whizard-media-uploader` is `class="hidden-uploader"` and disconnected.

**`libs/shared/ui/src/media-uploader/media-uploader.component.ts`**
- Add public `openFilePicker()` method that calls `this.fileInput.nativeElement.click()`
- Expose `#fileInput` as `@ViewChild`

**`college-form.component.html`**
- Add `#logoUploader` ref to `<whizard-media-uploader>` for logo
- Add `(click)="logoUploader.openFilePicker()"` to the circle button

---

## 8. Frontend — Fix Image/Video Upload Not Linked to College

**Root cause:** After upload, `ManageCollegeComponent` adds the asset to `mediaAssets` signal  
but never links it to the college as a `mediaItem`. Save payload never includes `mediaItems`.

**`college-form.component.ts`**
- Change `mediaUploadRequested` output type to include `role: string`:  
  `output<{ file: File; type: string; role: string }>()`
- Each upload handler emits with its role:
  - logo → `role: 'logo'`
  - brochure → `role: 'brochure'`
  - video → `role: 'promotional_video'`
  - gallery → `role: 'campus_gallery'`

**`manage-college.component.ts`**
- Add `pendingMediaItems = signal<{mediaAssetId: string; mediaRole: string; sortOrder: number}[]>([])`
- In `onMediaUploadRequested()`: on success, append to `pendingMediaItems` (logo replaces existing)
- In `onSaved()` / `onPublished()`: merge existing `college.mediaItems` with `pendingMediaItems`,  
  pass as `mediaItems` in update payload
- Reset `pendingMediaItems` on back/cancel

**Upload UI height fix** (`college-form.component.html`)
- Add consistent `min-h-[120px]` to both the file-added row and the upload slot

---

## 9. Frontend — Quill Editor Toolbar (screenshot-ui-3)

**`libs/shared/ui/src/quill-editor/quill-editor.component.ts`**

Replace toolbar config:
```typescript
// Before
[['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']]

// After
[
  ['bold', 'italic'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
]
```

Update container background:
- `background: var(--wrcf-bg-card, #1E293B)` → `background: var(--wrcf-bg-primary, #0F172A)`

---

## 10. Frontend — Quill Section Labels in Accent Color

**`college-form.component.html`**
- Change section headings above each Quill editor to use `text-wrcf-accent` (matching  
  screenshot-ui-3's "College Details" label in `#00BFFF`)

---

## 11. Frontend — Right Panel Scrolling

Detail panel already has `overflow-y-auto` on content div. Add thin custom scrollbar styling  
in `college-detail-panel.component.css` if the native scrollbar looks unstyled.

---

## Files to Modify

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `cityCode` to City |
| `prisma/seeds/college-operations.seed.ts` | Add cityCode values |
| `libs/contexts/college-operations/src/domain/aggregates/college.aggregate.ts` | New code generation |
| `libs/contexts/college-operations/src/application/commands/create-college.command.ts` | Add `cityCode` |
| `libs/contexts/college-operations/src/application/command-handlers/create-college.handler.ts` | Fetch and pass cityCode |
| `libs/contexts/college-operations/src/application/query-handlers/get-college-by-id.handler.ts` | Enrich contacts + cityName |
| `libs/contexts/college-operations/src/application/mappers/college.mapper.ts` | Accept userMap + cityName |
| `libs/shared/ui/src/media-uploader/media-uploader.component.ts` | Expose `openFilePicker()` |
| `libs/shared/ui/src/quill-editor/quill-editor.component.ts` | Toolbar + bg update |
| `apps/web/admin-portal/src/app/pages/manage-college/manage-college.component.html` | Move search out, add Back button, mat-flat-button |
| `apps/web/admin-portal/src/app/pages/manage-college/manage-college.component.ts` | onBackClicked, pendingMediaItems, upload role tracking |
| `apps/web/admin-portal/src/app/pages/manage-college/components/college-list-panel/college-list-panel.component.html` | Add search input, widen panel to 320px |
| `apps/web/admin-portal/src/app/pages/manage-college/components/college-list-panel/college-list-panel.component.ts` | Own searchQuery internally |
| `apps/web/admin-portal/src/app/pages/manage-college/components/college-detail-panel/college-detail-panel.component.html` | mat-flat-button on Edit |
| `apps/web/admin-portal/src/app/pages/manage-college/components/college-form/college-form.component.html` | Logo click fix, upload UI height, accent labels |
| `apps/web/admin-portal/src/app/pages/manage-college/components/college-form/college-form.component.ts` | mediaUploadRequested includes role |
