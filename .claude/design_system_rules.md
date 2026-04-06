# Whizard Platform — Design System Rules

> Generated for Figma MCP integration. Use this file when implementing Figma designs as Angular components.
> Last updated: 2026-04-06

---

## 1. Token Definitions

### 1.1 WRCF Semantic Color Tokens

Defined in `/libs/shared/theme/src/styles/tailwind/theme.css` (`@theme` block, lines 138-157).

| CSS Variable                    | Value                        | Usage                                       |
| ------------------------------- | ---------------------------- | ------------------------------------------- |
| `--color-wrcf-bg-primary`     | `#0F172A`                  | Main page bg, header, container             |
| `--color-wrcf-bg-secondary`   | `#0F253F`                  | Sidebars, filter bars, dropdown backgrounds |
| `--color-wrcf-bg-card`        | `#1E293B`                  | Card/panel backgrounds, tooltips            |
| `--color-wrcf-bg-selected`    | `#2D2A5A`                  | Selected list item background               |
| `--color-wrcf-text-primary`   | `#E8F0FA`                  | Body text, headings, primary text           |
| `--color-wrcf-text-secondary` | `#7F94AE`                  | Labels, muted text, hints                   |
| `--color-wrcf-text-tertiary`  | `#8AB4F8`                  | Item codes, helper text, secondary info     |
| `--color-wrcf-border`         | `#484E5D`                  | All borders, dividers, outlines             |
| `--color-wrcf-action`         | `var(--color-primary-600)` | Primary buttons, panel headers              |
| `--color-wrcf-action-hover`   | `var(--color-primary-700)` | Button hover state                          |
| `--color-wrcf-accent`         | `#00BFFF`                  | Secondary buttons, focus rings, accents     |
| `--color-wrcf-error`          | `#fca5a5`                  | Error text, validation messages             |

**In templates** use Tailwind utilities where available:

```html
<div class="bg-wrcf-bg-primary text-wrcf-text-primary border-wrcf-border">
```

**In CSS** always provide a fallback hex:

```css
background: var(--wrcf-bg-primary, #0F172A);
color: var(--wrcf-text-primary, #E8F0FA);
```

### 1.2 Dynamic Tonal Palette (Primary & Error)

Generated at runtime by `ThemingService` via HSLuv-based `TonalPalette` and injected into `:root`:

```css
--theme-color-primary-50 … --theme-color-primary-950
--theme-color-error-50   … --theme-color-error-950
```

These map to Tailwind utilities via `--color-primary-{n}` aliases. Use `--color-wrcf-action` (which resolves to `primary-600`) for buttons; never hardcode the hex.

### 1.3 Neutral Palette (Surfaces)

Zinc-based static palette:

```css
--color-neutral-50 … --color-neutral-950
```

Used for light-mode surfaces; in dark mode switch to WRCF bg tokens.

### 1.4 Typography Tokens

**File**: `/libs/shared/theme/src/styles/tailwind/theme.css`

| Style           | Tailwind Classes                                                    | Size | Weight | Line Height | Color token            |
| --------------- | ------------------------------------------------------------------- | ---- | ------ | ----------- | ---------------------- |
| h2 (page title) | `text-[22px] font-medium leading-[25px]`                          | 22px | 500    | 25px        | `text-wrcf-text-primary` |
| h3 (section)    | `text-[22px] font-medium leading-[1.4]`                           | 22px | 500    | 1.4         | `text-wrcf-text-primary` |
| sectionHeading  | `text-xl font-medium leading-[25px]`                              | 20px | 500    | 25px        | `text-wrcf-text-tertiary` (`#8AB4F8`) |
| bodyMd          | `text-[15px] font-normal leading-[22px]`                          | 15px | 400    | 22px        | `text-wrcf-text-primary` |
| label           | `text-sm font-medium`                                             | 13px | 500    | 18px        | `text-wrcf-text-secondary` |
| caption         | `text-xs font-normal`                                             | 12px | 400    | 16px        | `text-wrcf-text-secondary` |

> **sectionHeading** (new from Figma `node 39:192539`): used for sub-section titles inside "About the Internship" blocks and similar content area headings. Always `text-wrcf-text-tertiary` (`#8AB4F8`), **not** `text-wrcf-text-secondary`.

**Font**: Poppins only (`--font-sans: 'Poppins', system-ui`). Never use Roboto or Inter.
> The Figma source uses Red Hat Display and Inter — these are **not** adopted; map all text to Poppins at the same size/weight.

### 1.5 Material M3 Corner Radius Tokens

Defined in `/libs/shared/theme/src/styles/components/material.css`:

```css
--mat-sys-corner-extra-large: 28px;
--mat-sys-corner-large:       16px;
--mat-sys-corner-medium:      12px;
--mat-sys-corner-small:        8px;
--mat-sys-corner-extra-small:  4px;
--mat-sys-corner-none:          0;
--mat-sys-corner-full:       9999px;
```

WRCF component radius reference:

- Dropdowns / inputs: `10px` (`border-radius: 10px`)
- Buttons: `10px`
- Cards/panels: `14px`
- Badges: `10px`

### 1.6 Elevation (Shadow Tokens)

```css
--mat-sys-level0  →  none
--mat-sys-level1  →  sm shadow
…
--mat-sys-level5  →  xl shadow
```

---

## 2. Component Specifications

### 2.1 Header

- Height: `64px` → `h-16`
- Padding X: `32px` → `px-8`
- Background: `bg.primary` (`#0F172A`)
- Title: h2 (`text-3xl font-semibold text-wrcf-text-primary`)
- Border bottom: `1px solid #484E5D`

### 2.2 Selection Column (List Panel)

- Width: `260px` → `w-[260px]`
- Radius: `14px`
- Background: `bg.card` (`#1E293B`)
- Header height: `56px`, bg `action` (`#314DDF`), title h3
- Item height: `48px`, style bodyMd
- Selected item: `bg.selected` (`#2D2A5A`) + `4px left border accent` (`#00BFFF`)

### 2.3 Dropdown / Select

- Height: `40px` → `h-10`
- Padding X: `12px`
- Radius: `10px`
- Background: `bg.secondary` (`#0F253F`)
- Border: `1px solid #484E5D`

### 2.4 Buttons

| Variant   | Background                      | Text        | Hover                   |
| --------- | ------------------------------- | ----------- | ----------------------- |
| Primary   | `#314DDF` (action)            | `#E8F0FA` | `#263FCC`             |
| Secondary | `#00BFFF` (accent)            | `#0F172A` | `#00a8e0`             |
| Outline   | transparent +`border #484E5D` | `#7F94AE` | border/text `#E8F0FA` |

All buttons: height `40px`, padding X `16px`, radius `10px`.

### 2.5 Badge

- Size: `20×20px`
- Radius: `10px` (full circle)
- Background: `action` (`#314DDF`)
- Text: caption (12px/400)

---

## 3. Component Library

### 3.1 Shared UI — Exported Components

**Import alias**: `@whizard/shared-ui`
**Barrel**: `/libs/shared/ui/src/index.ts`

| Component / Service        | Export Name                | Purpose                        |
| -------------------------- | -------------------------- | ------------------------------ |
| `ScrollbarDirective`     | `ScrollbarDirective`     | Custom scrollbar styling       |
| `QuillEditorComponent`   | `QuillEditorComponent`   | Rich text / WYSIWYG editor     |
| `PdfViewerComponent`     | `PdfViewerComponent`     | PDF overlay viewer             |
| `VideoPlayerComponent`   | `VideoPlayerComponent`   | Video overlay player           |
| `ImageLightboxComponent` | `ImageLightboxComponent` | Image gallery lightbox         |
| `MediaUploaderComponent` | `MediaUploaderComponent` | Drag-drop file upload          |
| `AdminLayoutComponent`   | `AdminLayoutComponent`   | Admin shell layout             |
| `AdminSidebarComponent`  | `AdminSidebarComponent`  | Sidebar navigation             |
| `PageActionsService`     | `PageActionsService`     | Dynamic header action buttons  |
| `LoginPageComponent`     | —                         | Auth pages (login/signup/etc.) |

### 3.2 Angular Material Modules Used

Always import specific modules (no `MatModule` barrel):

```typescript
import { MatButtonModule }    from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatIconModule }      from '@angular/material/icon';
import { MatTabsModule }      from '@angular/material/tabs';
import { MatDivider }         from '@angular/material/divider';
import { MatChipsModule }     from '@angular/material/chips';
import { MatDialogModule }    from '@angular/material/dialog';
```

---

## 4. Icon System

Two icon sets, both used via `MatIconModule` (SVG icon registry):

| Set               | Selector Prefix        | Example                    |
| ----------------- | ---------------------- | -------------------------- |
| Heroicons outline | `heroicons_outline:` | `heroicons_outline:plus` |
| Lucide Icons      | `lucideIcons:`       | `lucideIcons:upload`     |

**Usage in templates**:

```html
<mat-icon svgIcon="heroicons_outline:plus" class="size-4" />
<mat-icon svgIcon="lucideIcons:panel-left" class="size-5" />
```

**Usage with icon buttons**:

```html
<button matIconButton>
  <mat-icon svgIcon="lucideIcons:plus" class="size-5" />
</button>
```

Size classes: `size-4` (16px), `size-5` (20px), `size-6` (24px).

---

## 5. Styling Approach

### 5.1 Layer Architecture

```
libs/shared/theme/src/styles/theme.css   ← single import in angular.json
├── @import 'tailwindcss' important
├── tailwind/theme.css          — @theme block (all tokens)
├── tailwind/variants.css       — dark mode variant
├── tailwind/utilities.css      — prose, custom utilities
├── base/base.css               — viewport, focus, router-outlet
├── base/typography.css         — font smoothing
├── components/material.css     — Angular Material M3 overrides
├── components/input.css        — autofill suppression
├── third-party/lucide-icons.css
└── third-party/perfect-scrollbar.css
```

### 5.2 Styling in Components

**Preferred**: Tailwind utility classes in templates.

```html
<div class="flex flex-col h-full bg-wrcf-bg-primary font-sans overflow-hidden">
  <div class="flex items-center h-16 px-8 shrink-0 border-b border-wrcf-border">
```

**Component CSS file**: Use for Material overrides and host-scoped rules only.

```css
/* college-form.component.css */
.wrcf-field .mat-mdc-text-field-wrapper {
  background: var(--color-wrcf-bg-secondary, #0F253F);
  border-radius: 10px;
}
```

**Never hardcode hex colors** outside of the `@theme` block or fallback values.

### 5.3 Dark Mode

Uses `light-dark()` CSS function + `.scheme-dark` class on `<html>`:

- `ThemingService` sets `document.documentElement.classList` based on localStorage or `prefers-color-scheme`
- Custom Tailwind variant: `dark:` targets `.scheme-dark` parent

WRCF background tokens already encode the correct dark values; use them directly.

### 5.4 Material Form Field Override Pattern

Apply `.wrcf-field` on `<mat-form-field>` and override in component CSS:

```html
<mat-form-field appearance="outline" class="w-full wrcf-field">
  <mat-label>Field label</mat-label>
  <input matInput formControlName="fieldName" />
  @if (form.get('fieldName')?.invalid && form.get('fieldName')?.touched) {
    <mat-error>Field is required</mat-error>
  }
</mat-form-field>
```

```css
.wrcf-field .mat-mdc-text-field-wrapper {
  background: var(--color-wrcf-bg-secondary, #0F253F);
  border-radius: 10px;
}
.wrcf-field .mat-mdc-form-field-subscript-wrapper {
  margin-top: 2px;
}
```

---

## 6. Angular Patterns

### 6.1 Component Skeleton

```typescript
import { Component, inject, signal, computed, viewChild, effect, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PageActionsService } from '@whizard/shared-ui';

@Component({
  selector: 'whizard-my-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.css',
})
export class MyComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly pageActions = inject(PageActionsService);

  // Signals
  protected loading = signal(false);
  protected mode = signal<'list' | 'edit' | 'create'>('list');

  // Computed
  protected formIsValid = computed(() => this.formRef()?.isValid ?? false);

  // ViewChild
  private readonly formRef = viewChild(MyFormComponent);

  // Form
  protected form = this.fb.group({
    name: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const mode = this.mode();
      const isValid = this.formIsValid();
      this.pageActions.set([
        { label: 'Save', variant: 'primary', disabled: !isValid, action: () => this.save() },
      ]);
    });
  }

  ngOnInit(): void { /* load data */ }

  ngOnDestroy(): void {
    this.pageActions.clear();
  }

  protected save(): void { /* submit form */ }
}
```

### 6.2 Reactive Form Builder

```typescript
protected form = this.fb.group({
  name:     ['', Validators.required],
  email:    ['', [Validators.required, Validators.email]],
  roleId:   [null as string | null],
  notes:    [''],
});
```

**Patch on load**:

```typescript
this.form.patchValue({ name: item.name, email: item.email });
```

**Reset**:

```typescript
this.form.reset();
```

**Access value**:

```typescript
const payload = this.form.getRawValue();
```

### 6.3 Template Control Flow (Angular 17+)

```html
@if (loading()) {
  <div class="flex items-center justify-center h-full">Loading…</div>
}

@for (item of items(); track item.id) {
  <div class="flex items-center h-12 px-4">{{ item.name }}</div>
}

@switch (mode()) {
  @case ('list') { <list-panel /> }
  @case ('edit') { <edit-form /> }
}
```

Never use `*ngIf`, `*ngFor`, `[ngSwitch]` — always use the new `@if`/`@for`/`@switch` syntax.

### 6.4 Multi-Panel Layout Pattern

```html
<!-- Page shell -->
<div class="flex flex-col h-full bg-wrcf-bg-primary font-sans overflow-hidden">

  <!-- Optional error banner -->
  @if (errorMessage()) {
    <div class="flex items-center px-8 py-3 bg-red-950/50 border-b border-red-800/50 text-sm text-red-300">
      {{ errorMessage() }}
    </div>
  }

  <!-- Workspace (fills remaining height) -->
  <div class="flex-1 flex overflow-hidden">

    @if (mode() === 'list') {
      <!-- Left: selection column (260px) -->
      <div class="w-[260px] shrink-0 flex flex-col bg-wrcf-bg-card rounded-[14px] m-4 overflow-hidden">
        <!-- header -->
        <div class="flex items-center h-14 px-4 bg-wrcf-action shrink-0">
          <span class="text-2xl font-medium text-wrcf-text-primary">Items</span>
        </div>
        <!-- list -->
        <div class="flex-1 overflow-y-auto">
          @for (item of items(); track item.id) {
            <div
              class="flex items-center h-12 px-4 cursor-pointer transition-colors"
              [class.bg-wrcf-bg-selected]="selectedId === item.id"
              [style.borderLeft]="selectedId === item.id ? '4px solid #00BFFF' : '4px solid transparent'"
              (click)="onSelect(item)">
              {{ item.name }}
            </div>
          }
        </div>
      </div>

      <!-- Right: detail panel -->
      <div class="flex-1 flex flex-col overflow-hidden m-4 ml-0 bg-wrcf-bg-card rounded-[14px]">
        <!-- detail content -->
      </div>
    }

    @if (mode() === 'edit' || mode() === 'create') {
      <!-- Form panel -->
      <whizard-my-form [item]="selected()" (saved)="onSaved()" />
    }

  </div>
</div>
```

### 6.5 Page Actions (Header Buttons)

Register in constructor `effect()`, clear in `ngOnDestroy()`:

```typescript
constructor() {
  effect(() => {
    const mode = this.mode();
    const isValid = this.formIsValid();

    if (mode === 'list') {
      this.pageActions.set([
        { label: 'Add', icon: 'heroicons_outline:plus', variant: 'primary', action: () => this.onAdd() },
      ]);
    } else {
      this.pageActions.set([
        { label: 'Back',  icon: 'heroicons_outline:arrow-left', variant: 'outline',   action: () => this.onBack() },
        { label: 'Save',  variant: 'primary', disabled: !isValid,                      action: () => this.onSave() },
        { label: 'Cancel', variant: 'outline',                                          action: () => this.onCancel() },
      ]);
    }
  });
}

ngOnDestroy(): void {
  this.pageActions.clear();
}
```

---

## 7. Project Structure Reference

```
apps/web/admin-portal/src/app/pages/<feature>/
  <feature>.component.ts          ← page root, signals + page actions
  <feature>.component.html
  <feature>.component.css
  components/
    <feature>-list-panel/
    <feature>-detail-panel/
    <feature>-form/
      tabs/                       ← optional tabbed sub-forms
    <feature>-preview/
  models/
    <feature>.models.ts
  services/
    <feature>-api.service.ts

libs/shared/ui/src/               ← @whizard/shared-ui
libs/shared/theme/src/styles/     ← all CSS tokens & utilities
prisma/schema.prisma              ← single DB schema
```

---

## 8. Critical Conventions Summary

| Rule                      | Detail                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Framework**       | Angular 21, standalone components only — no NgModules                              |
| **Reactivity**      | Signals + computed + effects; avoid `BehaviorSubject` in components               |
| **Forms**           | `ReactiveFormsModule` + `FormBuilder.group()` always                            |
| **Template syntax** | `@if` / `@for` / `@switch` — never `*ngIf` / `*ngFor`                    |
| **Font**            | Poppins only — never Roboto or Inter                                               |
| **Colors**          | CSS variables only — no hardcoded hex in component CSS or templates                |
| **Icons**           | `mat-icon [svgIcon]` with `heroicons_outline:*` or `lucideIcons:*`            |
| **Material**        | `appearance="outline"`, specific module imports, `.wrcf-field` override pattern |
| **Layout**          | Flexbox via Tailwind (`flex flex-col h-full overflow-hidden`)                     |
| **Imports**         | `@whizard/*` path aliases — never relative cross-package paths                   |
| **Package manager** | `pnpm` exclusively                                                                |
| **Dark mode**       | Use WRCF bg/text tokens; avoid `light-dark()` in component CSS unless needed      |
| **Page actions**    | Register in `effect()`, clear in `ngOnDestroy()`                                |
| **Scrollbar**       | Apply `ScrollbarDirective` from `@whizard/shared-ui` on scrollable panels       |

---

## 9. Figma → Angular Implementation Checklist

When implementing a Figma frame as an Angular component:

- [ ] Read `.design_system_rules.md` (this file) before writing any code
- [ ] Match component type: list panel / form / detail panel / page shell
- [ ] Use WRCF color tokens — never hardcode hex values from Figma
- [ ] Apply typography tokens matching the Figma text styles
- [ ] Import only the Angular Material modules the component actually needs
- [ ] Use `FormBuilder.group()` for all forms; add `Validators` as specified
- [ ] Validate in template with `@if (form.get(...)?.invalid && touched)`
- [ ] Use `@if` / `@for` control flow — never structural directives
- [ ] Register header action buttons via `PageActionsService` in `effect()`
- [ ] Apply `ScrollbarDirective` on any scrollable `overflow-y-auto` containers
- [ ] Use Tailwind utilities for layout; use `.wrcf-field` CSS class for Material field overrides
- [ ] Test that the component renders correctly in dark mode (`.scheme-dark`)
