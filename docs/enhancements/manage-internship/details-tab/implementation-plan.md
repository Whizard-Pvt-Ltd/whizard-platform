# Implementation Plan — Manage Internship · Details Tab UI

**Source:** Figma node `39-185992` (Whizard Web Designs)
**Scope:** Frontend only — no DB, no API, no backend changes.

---

## 1. Design Reference Summary

| Element | Figma spec |
|---|---|
| Canvas | 1440 × 1024, bg `#0F172A` |
| Header | 65px tall, `bg-wrcf-bg-primary`, border-bottom `border-wrcf-border` |
| Left panel | 466px wide × 905px tall, scrollable card list |
| Card height | 122px each |
| Right panel | 963px wide — tab nav (50px) + scrollable content |
| Tab labels | Details · Screening Criteria · Selection · During Internship · Final Submission |
| Active tab indicator | accent underline (`#00BFFF`) |
| Inner content frame | 935px wide, vertical scroll, 20px gap between sections |
| Font | Red Hat Display in Figma → Poppins in code (WRCF v3.2) |

---

## 2. Data Model

**No DB changes.** All fields already exist on `InternshipDetail` / `InternshipFormValue`.

---

## 3. Frontend Changes

### 3.1 Page Shell — `manage-internship.component.html`

The left panel width is owned by the child component via host binding (§3.2), so the shell needs no structural changes. Confirm the workspace `<div>` already has `flex-1 flex overflow-hidden` — it does.

---

### 3.2 Left Panel — `internship-list-panel.component.ts` + `.html`

#### `.ts` — host class

Move width + base layout to a `host` binding so it is always enforced:

```ts
@Component({
  selector: 'whizard-internship-list-panel',
  host: {
    class: 'flex flex-col w-[466px] min-w-[466px] h-full overflow-hidden border-r border-wrcf-border bg-[#0F172A]'
  },
  ...
})
```

Remove the width/height/bg classes from the root `<div>` in the template.

#### `.html` — search bar (shrink-0)

```html
<div class="shrink-0 px-2 py-2 border-b border-wrcf-border">
  <div class="flex items-center gap-2 h-12 px-3 rounded-[10px]
              bg-wrcf-bg-secondary border border-wrcf-border">
    <mat-icon svgIcon="heroicons_outline:magnifying-glass"
              class="size-4 text-wrcf-text-secondary shrink-0" />
    <input type="text" placeholder="Search internships..."
           [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
           class="flex-1 bg-transparent text-sm text-wrcf-text-primary
                  placeholder:text-wrcf-text-secondary outline-none border-none min-w-0" />
  </div>
</div>
```

#### `.html` — scrollable card list

```html
<div class="flex-1 overflow-y-auto">

  <!-- loading skeletons (unchanged) -->

  <!-- empty state (unchanged) -->

  @for (item of filteredInternships(); track item.id) {
    <button type="button" (click)="select(item.id)"
      class="w-full text-left border-b border-wrcf-border/40 border-l-4 transition-colors duration-150"
      [class.border-l-wrcf-accent]="selectedId() === item.id"
      [class.border-l-transparent]="selectedId() !== item.id"
      [class.bg-wrcf-bg-selected]="selectedId() === item.id"
      [class.hover:bg-wrcf-bg-secondary]="selectedId() !== item.id">

      <div class="px-[15px] py-[15px] space-y-[10px]">

        <!-- Banner image or placeholder -->
        @if (item.bannerImageUrl) {
          <img [src]="item.bannerImageUrl" [alt]="item.title"
               class="w-full h-20 rounded-lg object-cover shrink-0" />
        } @else {
          <div class="w-full h-20 rounded-lg bg-wrcf-bg-secondary
                      flex items-center justify-center shrink-0">
            <mat-icon svgIcon="heroicons_outline:briefcase"
                      class="size-8 text-wrcf-text-secondary opacity-40" />
          </div>
        }

        <!-- Title + status badge -->
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-wrcf-text-primary
                    leading-5 flex-1 min-w-0 truncate">
            {{ item.title }}
          </p>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                [class]="statusColors[item.status]">
            {{ statusLabels[item.status] ?? item.status }}
          </span>
        </div>

        <!-- Meta chips -->
        <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-wrcf-text-secondary">
          @if (item.cityName) {
            <span class="flex items-center gap-1">
              <mat-icon svgIcon="heroicons_outline:map-pin" class="size-3 shrink-0" />
              {{ item.cityName }}
            </span>
          }
          <span class="flex items-center gap-1">
            <mat-icon svgIcon="heroicons_outline:users" class="size-3 shrink-0" />
            {{ item.vacancies }} Vacanc{{ item.vacancies === 1 ? 'y' : 'ies' }}
          </span>
          <span class="flex items-center gap-1">
            <mat-icon svgIcon="heroicons_outline:clock" class="size-3 shrink-0" />
            {{ item.durationMonths }} Month{{ item.durationMonths === 1 ? '' : 's' }}
          </span>
          @if (item.stipend) {
            <span class="flex items-center gap-1">
              <mat-icon svgIcon="heroicons_outline:currency-rupee" class="size-3 shrink-0" />
              ₹{{ item.stipend | number }}
            </span>
          }
          <span class="flex items-center gap-1">
            <mat-icon svgIcon="heroicons_outline:computer-desktop" class="size-3 shrink-0" />
            {{ item.internshipType === 'ONSITE' ? 'On-Site' : 'Remote' }}
          </span>
        </div>

      </div>
    </button>
  }
</div>
```

---

### 3.3 Right Panel — `internship-detail-panel.component.ts` + `.html`

#### `.ts` changes

```ts
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'whizard-internship-detail-panel',
  encapsulation: ViewEncapsulation.None,  // allows ::ng-deep tab scroll fix
  host: { class: 'flex flex-col flex-1 min-w-0 overflow-hidden' },
  ...
})
```

#### `.html` — internship header (shrink-0)

Replaces the current header `<div class="shrink-0 px-6 pt-5 pb-4 border-b ...">`:

```html
<div class="shrink-0 px-6 pt-5 pb-4 border-b border-wrcf-border">
  <div class="flex items-start justify-between gap-4">

    <!-- Left: title + status + meta + stat grid -->
    <div class="flex-1 min-w-0 space-y-3">

      <!-- Title + status badge -->
      <div class="flex items-center gap-3 flex-wrap">
        <h2 class="text-xl font-semibold text-wrcf-text-primary truncate">
          {{ internship()!.title }}
        </h2>
        <span class="text-xs px-2 py-0.5 rounded-full font-medium"
              [class]="statusColors[internship()!.status] ?? 'bg-gray-500/20 text-gray-400'">
          {{ statusLabels[internship()!.status] ?? internship()!.status }}
        </span>
      </div>

      <!-- Type + location -->
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-wrcf-text-secondary">
        <span>{{ internship()!.internshipType === 'ONSITE' ? 'On-Site' : 'Remote' }}</span>
        @if (internship()!.cityName) {
          <span class="flex items-center gap-1">
            <mat-icon svgIcon="heroicons_outline:map-pin" class="size-3 shrink-0" />
            {{ internship()!.cityName }}
          </span>
        }
      </div>

      <!-- 4-tile stats grid -->
      <div class="grid grid-cols-4 gap-3">
        <div class="rounded-lg bg-wrcf-bg-secondary border border-wrcf-border px-3 py-2">
          <p class="text-[11px] text-wrcf-text-secondary">Vacancies</p>
          <p class="text-sm font-semibold text-wrcf-text-primary mt-0.5">
            {{ internship()!.vacancies }}
          </p>
        </div>
        <div class="rounded-lg bg-wrcf-bg-secondary border border-wrcf-border px-3 py-2">
          <p class="text-[11px] text-wrcf-text-secondary">Duration</p>
          <p class="text-sm font-semibold text-wrcf-text-primary mt-0.5">
            {{ internship()!.durationMonths }} mo
          </p>
        </div>
        @if (internship()!.stipend) {
          <div class="rounded-lg bg-wrcf-bg-secondary border border-wrcf-border px-3 py-2">
            <p class="text-[11px] text-wrcf-text-secondary">Stipend</p>
            <p class="text-sm font-semibold text-wrcf-text-primary mt-0.5">
              ₹{{ internship()!.stipend }}
            </p>
          </div>
        }
        @if (internship()!.applicationDeadline) {
          <div class="rounded-lg bg-wrcf-bg-secondary border border-wrcf-border px-3 py-2">
            <p class="text-[11px] text-wrcf-text-secondary">Deadline</p>
            <p class="text-sm font-semibold text-wrcf-text-primary mt-0.5">
              {{ internship()!.applicationDeadline | date:'mediumDate' }}
            </p>
          </div>
        }
      </div>
    </div>

    <!-- Right: Edit button -->
    <button (click)="editClicked.emit()"
      class="shrink-0 h-10 px-4 rounded-[10px] bg-wrcf-action text-wrcf-text-primary
             text-sm font-medium hover:bg-wrcf-action-hover transition-colors">
      Edit
    </button>
  </div>
</div>
```

#### `.html` — tab group

Replace `<mat-tab-group>` and all its tabs. Each tab body gets `overflow-y-auto h-full` on its inner wrapper.

**Tab label renames:**
| Old label | New label |
|---|---|
| Details | Details _(unchanged)_ |
| Screening | Screening Criteria |
| Selection | Selection _(unchanged)_ |
| During | During Internship |
| Final | Final Submission |

**Details tab content:**

```html
<mat-tab label="Details">
  <div class="overflow-y-auto h-full px-6 py-5 space-y-5">

    <h3 class="text-[22px] font-medium text-wrcf-text-primary leading-[25px]">
      About the internship
    </h3>

    @if (aboutSections().every(s => !s.value)) {
      <p class="text-sm text-wrcf-text-secondary italic">No details added yet.</p>
    }

    @for (section of aboutSections(); track section.label) {
      @if (section.value) {
        <div class="rounded-lg bg-wrcf-bg-card border border-wrcf-border px-5 py-4 space-y-2">
          <p class="text-xs font-semibold text-wrcf-text-secondary uppercase tracking-wide">
            {{ section.label }}
          </p>
          <p class="text-sm text-wrcf-text-primary whitespace-pre-wrap leading-relaxed">
            {{ section.value }}
          </p>
        </div>
      }
    }
  </div>
</mat-tab>
```

The 8 sections rendered by `aboutSections()` (already defined in `.ts`):
1. Internship Detail
2. Role Overview
3. Key Responsibilities
4. Eligibility Requirements
5. Timeline & Work Schedule
6. Perks & Benefits
7. Selection Process
8. Contact Information

All other tabs (Screening Criteria, Selection, During Internship, Final Submission): keep existing content, only wrap the inner `<div>` with `overflow-y-auto h-full`.

#### `.html` — mat-tab-group host

```html
<mat-tab-group animationDuration="0ms" class="detail-tabs flex-1 min-h-0">
```

#### Scroll + style fix — `styles.scss`

Add to `apps/web/admin-portal/src/styles.scss`, scoped to the component selector:

```scss
whizard-internship-detail-panel {
  // Make tab body fill remaining height so inner div can scroll
  .detail-tabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    .mat-mdc-tab-body-wrapper {
      flex: 1;
      min-height: 0;
    }

    .mat-mdc-tab-body {
      overflow: hidden;
    }

    .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    // Tab header colors
    .mat-mdc-tab-header {
      border-bottom: 1px solid #484E5D;
    }

    .mat-mdc-tab .mdc-tab__text-label {
      color: #7F94AE; // text.secondary
    }

    .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #E8F0FA; // text.primary
    }

    .mdc-tab-indicator__content--underline {
      border-color: #00BFFF; // accent
    }
  }
}
```

---

### 3.4 Details Tab Form (edit mode) — `details-tab.component.html`

**Change 1 — scroll fix:** Add `h-full` to root `<div>`:

```html
<!-- BEFORE -->
<div class="flex flex-col p-6 space-y-6 overflow-y-auto">

<!-- AFTER -->
<div class="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
```

**Change 2 — heading:**

```html
<!-- BEFORE -->
<h3 class="text-xl font-semibold text-wrcf-accent">About the Internship</h3>

<!-- AFTER -->
<h3 class="text-[22px] font-medium text-wrcf-text-primary leading-[25px]">
  About the Internship
</h3>
```

No other changes to the form — field layout, mat-form-field styles, and banner upload are already correct.

---

## 4. Files to Modify

| File | Change |
|---|---|
| `internship-list-panel.component.ts` | Add `host` class (`w-[466px] min-w-[466px] h-full ...`); remove width from template root `<div>` |
| `internship-list-panel.component.html` | Search bar height h-12, card layout reskin (banner + title+badge row + meta chips row), selected state (accent left border + `bg-wrcf-bg-selected`) |
| `internship-detail-panel.component.ts` | Add `encapsulation: ViewEncapsulation.None`; add `host` class |
| `internship-detail-panel.component.html` | New header section; rename tab labels; wrap each tab body `<div>` with `overflow-y-auto h-full`; Details tab "About" heading + section cards |
| `details-tab.component.html` | Add `h-full` to root div; fix heading size/color |
| `apps/web/admin-portal/src/styles.scss` | Add `.detail-tabs` scroll fix + tab header color overrides scoped to `whizard-internship-detail-panel` |

## 5. Files to Create

None — pure reskin, no new components or services.

---

## 6. Out of Scope

- Other tabs content (Screening Criteria, Selection, During Internship, Final Submission) — inner content unchanged; only the scroll wrapper is added.
- Edit / create mode right panel (assessment library + form tabs other than Details) — no changes.
- Backend, API, DB — no changes.
- Mobile / responsive layout — desktop only (1440px canvas).
