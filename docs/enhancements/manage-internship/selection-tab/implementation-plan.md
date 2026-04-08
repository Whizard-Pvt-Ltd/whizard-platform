# Implementation Plan — Manage Internship · Selection Tab UI

**Source:** Figma node `2129-23063` (Latest Whizard Web Design System)
**Scope:** Primarily frontend; one new BFF proxy endpoint if not already existing.

---

## 1. Design Reference Summary

| Element | Figma spec |
|---|---|
| Canvas | 1440 × 1024, bg `#0F172A` |
| Left panel | 466px, scrollable resource library (Assessment cards) |
| Tab active | "Selection" tab with `#314DDF` underline indicator |
| Main content | 963px wide, vertical scroll, 20px gap between sections |
| Section headers | `#8AB4F8` (text-tertiary), 20px, font-weight 600 |
| Input fields | bg `#0F253F`, radius 4px, shadow, 48px height |
| Upload buttons | bg `#314DDF`, 35px height, rounded-lg |
| Batch row | Inline: name + List/Create links (left), Batch Size + Coordinator dropdown (right) |
| + button | 33px circle, bg `#314DDF` |
| List/Create links | `#00BFFF`, underlined, bold |
| Drop zones | 199×126px, bg `#0F253F`, shadow, cloud-upload icon + label |
| Quill editor | bg `#0F253F`, rounded-lg, 18px body text |

---

## 2. Data Model

**No DB changes.** All fields already exist on `InternshipFormValue`, `InternshipBatch`, `FileItem`.

### New API calls (frontend → BFF)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/companies/cities` | List cities for plant dropdown (company-scoped) |
| GET | `/wrcf/roles` | List industry roles for internship title (company-scoped) |
| GET | `/internships/coordinators` | List users for coordinator dropdown (company-scoped) |
| GET | `/wrcf/functional-groups` | List functional groups for company tenantId & industry |

All four use `X-Company-Tenant-Id` header for tenant scoping.

**Loading strategy:** These APIs are called only when the user enters add/edit mode
(not on page init). For ADMIN/SYSTEM users editing an existing internship, the
`selectedCompanyTenantId` is set from the internship's `companyTenantId` before
making the calls, ensuring the correct company context.

---

## 3. Frontend Changes

### 3.1 API Service — `manage-internship-api.service.ts`

```ts
// Updated: now uses companyHeaders() for tenant scoping
listCities(): Observable<City[]> {
  return this.http
    .get<ApiEnvelope<City[]>>(`${environment.bffApiUrl}/companies/cities`, this.companyHeaders())
    .pipe(map(r => r.data));
}

// Updated: now uses companyHeaders() for tenant scoping
listIndustryRoles(): Observable<IndustryRole[]> {
  return this.http
    .get<ApiEnvelope<IndustryRole[]>>(`${environment.bffApiUrl}/wrcf/roles`, this.companyHeaders())
    .pipe(map(r => r.data));
}

// Updated: removed companyTenantId param, uses companyHeaders() instead
listCoordinators(): Observable<CoordinatorUser[]> {
  return this.http
    .get<ApiEnvelope<CoordinatorUser[]>>(`${this.base}/coordinators`, this.companyHeaders())
    .pipe(map(r => r.data));
}

// New method
listFunctionalGroups(): Observable<FunctionalGroup[]> {
  return this.http
    .get<ApiEnvelope<FunctionalGroup[]>>(
      `${environment.bffApiUrl}/wrcf/functional-groups`,
      this.companyHeaders()
    )
    .pipe(map(r => r.data));
}
```

Import `FunctionalGroup` from the models file.

---

### 3.2 Parent Component — `manage-internship.component.ts`

Add new signals:
```ts
protected coordinators = signal<CoordinatorUser[]>([]);
protected functionalGroups = signal<FunctionalGroup[]>([]);
```

**Removed from `init()`:** cities, industryRoles, coordinators, functionalGroups loading.
Only `loadList()` and `listCompaniesForSelector()` remain in `init()`.

**New method `loadFormDropdowns(companyTenantId?)`** — called from `onAddClicked()` and `onEditClicked()`:
```ts
private loadFormDropdowns(companyTenantId?: string | null): void {
  // For ADMIN/SYSTEM editing an existing internship, set the company context
  if (companyTenantId && this.isAdminOrSystemUser()) {
    this.authCtx.selectedCompanyTenantId.set(companyTenantId);
  }
  this.api.listCities().subscribe(c => this.cities.set(c));
  this.api.listIndustryRoles().subscribe(r => this.industryRoles.set(r));
  this.api.listCoordinators().subscribe(c => this.coordinators.set(c));
  this.api.listFunctionalGroups().subscribe(fg => this.functionalGroups.set(fg));
}
```

**Updated `onEditClicked()`** — passes `detail.companyTenantId`:
```ts
protected onEditClicked(): void {
  const detail = this.selectedInternship();
  if (detail) {
    this.formValue.set(detailToForm(detail));
    this.loadFormDropdowns(detail.companyTenantId);
    this.mode.set('edit');
  }
}
```

**Updated `onAddClicked()`** — calls with no tenantId (uses current selector):
```ts
protected onAddClicked(): void {
  this.selectedInternship.set(null);
  this.formValue.set({ ...EMPTY_FORM });
  this.loadFormDropdowns();
  this.mode.set('create');
}
```

---

### 3.3 Parent Template — `manage-internship.component.html`

Pass new inputs to `<whizard-internship-form>`:
```html
[coordinators]="coordinators()"
[functionalGroups]="functionalGroups()"
```

---

### 3.4 Form Component — `internship-form.component.ts` + `.html`

Add inputs:
```ts
readonly coordinators = input<CoordinatorUser[]>([]);
readonly functionalGroups = input<FunctionalGroup[]>([]);
```

Pass to `<whizard-selection-tab>` in template:
```html
[cities]="cities()"
[coordinators]="coordinators()"
[functionalGroups]="functionalGroups()"
```

---

### 3.5 Selection Tab — `selection-tab.component.ts`

Full rewrite. Key changes:

**New imports:**
- `QuillEditorComponent` from `@whizard/shared-ui`
- `ASSESSMENT_DRAG_TYPE` from `assessment-library-panel.component`
- `computed` from `@angular/core`

**New inputs:**
```ts
readonly cities = input<City[]>([]);
readonly coordinators = input<CoordinatorUser[]>([]);
readonly functionalGroups = input<FunctionalGroup[]>([]);
```

**New computed signal:**
```ts
protected readonly selectedCityName = computed(() => {
  const cityId = this.formValue().cityId;
  if (!cityId) return '';
  const city = this.cities().find(c => c.id === cityId);
  return city ? city.name : '';
});
```

**New drag-drop state and handlers:**
```ts
protected dragOverCourseIndex: number | null = null;
protected dragOverArticleIndex: number | null = null;

protected onDragOver(event, section, index) { ... }
protected onDragLeave(section) { ... }
protected onCourseDrop(event) { ... }
protected onArticleDrop(event) { ... }
```

**Removed:** `addCourse(event)`, `addArticle(event)` file upload handlers.

---

### 3.6 Selection Tab — `selection-tab.component.html`

Full rewrite with 7 sections:

#### Section 1: Offer Letter Documents
- Upload buttons for Offer Letter Template and Terms & Conditions (unchanged).
- Horizontal divider (`h-px bg-whizard-border/40`).
- **Offer Letter Release + Select Method in one row:**
  ```html
  <div class="flex items-center justify-between">
    <span>Offer Letter Release</span>
    <mat-form-field class="w-[341px]">Select Method dropdown</mat-form-field>
  </div>
  ```

#### Section 2: Assign Internship Co-ordinator
- Header row: title + 33px circle `+` button.
- Per batch: inline row with flex justify-between.
  - Left: "Internship Batch N" + List/Create links (`text-[#00BFFF] underline font-bold`).
  - Right: Batch Size input (150px) + Coordinator mat-select (200px) + trash button.
- Coordinator `<mat-select>` iterates `coordinators()`:
  ```html
  @for (user of coordinators(); track user.id) {
    <mat-option [value]="user.id">{{ user.name }}</mat-option>
  }
  ```

#### Section 3: Internship Process & Expectation
- **Select Plant**: `<input matInput readonly [value]="selectedCityName()" />`
- **Select Functional Group**: `<mat-select>` iterating `functionalGroups()`.

#### Section 4: Pre-Internship Communication
- `<whizard-quill-editor>` with `[ngModel]` bound to `preInternshipCommunication`.

#### Section 5: Add Pre-read Courses (drag-drop)
- Dropped items shown as cards (same style as Assessment filled zones in screening-criteria-tab).
- Always-visible drop zone with cloud-upload icon + "Drop Courses Here".
- Drag handlers: `onDragOver`, `onDragLeave`, `onCourseDrop`.

#### Section 6: Add Pre-read Articles (drag-drop)
- Same pattern as Courses but for articles.

---

## 4. Files Modified

| File | Change |
|---|---|
| `manage-internship-api.service.ts` | Add `listFunctionalGroups()`, update `listCoordinators()` |
| `manage-internship.component.ts` | Add `coordinators`, `functionalGroups` signals + load calls |
| `manage-internship.component.html` | Pass `[coordinators]` and `[functionalGroups]` to form |
| `internship-form.component.ts` | Add `coordinators`, `functionalGroups` inputs |
| `internship-form.component.html` | Pass `[cities]`, `[coordinators]`, `[functionalGroups]` to selection tab |
| `selection-tab.component.ts` | Full rewrite — new inputs, computed, drag-drop handlers, quill import |
| `selection-tab.component.html` | Full rewrite — all 7 sections per Figma |

## 5. Files Created

None — all changes are to existing files.

---

## 6. Backend Dependencies

| Endpoint | Status | Notes |
|---|---|---|
| `GET /internships/coordinators` | Existing | Must accept `X-Company-Tenant-Id` header |
| `GET /wrcf/functional-groups` | May need BFF proxy | Returns functional groups for company tenant + industry |

If the BFF proxy for `/wrcf/functional-groups` does not exist, add a route in the BFF that
proxies to Core API `GET /functional-groups?tenantId=X`.

---

## 7. Out of Scope

- List/Create batch modal dialogs — buttons are placeholders.
- Reordering dropped courses/articles.
- Mobile / responsive layout — desktop only (1440px canvas).
- Other tabs — unchanged.
- File upload fallback for courses/articles — removed in favour of drag-drop.
- Backend implementation of the functional-groups endpoint (if missing).
