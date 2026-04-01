# Implementation Plan: Project Theming — Apply Tailwind + Angular Material to WrcfDashboard

## Scope
Frontend only — `WrcfDashboardComponent` and all directly owned sub-components.

---

## 1. WrcfDashboardComponent (main page)

**`wrcf-dashboard.component.ts`**
- Add to imports: `ReactiveFormsModule`, `MatSelectModule`, `MatFormFieldModule`, `MatButtonModule`, `MatIconModule`
- Remove `FormsModule`; replace `[value]`/`(change)` select bindings with `FormControl` fields (`sectorControl`, `industryControl`)
- Inject `MatDialog` and replace `versionHistoryOpen`/`publishDraftOpen` signals + conditional rendering with `matDialog.open(VersionHistoryDialogComponent)` / `matDialog.open(PublishDraftDialogComponent)`
- Keep existing Angular 21 signal syntax throughout

**`wrcf-dashboard.component.html`**
- Remove all custom CSS classes; replace entirely with Tailwind utility classes matching WRCF tokens
- Replace `<select>` dropdowns with `<mat-form-field>` + `<mat-select>` bound to `FormControls`
- Replace all inline `<svg>` icons with `<mat-icon class="size-5" svgIcon="heroicons_outline:...">`
- Replace menu/user buttons with `<button mat-icon-button>`
- Remove `<whizard-version-history-dialog>` and `<whizard-publish-draft-dialog>` from template (opened via `MatDialog`)

**`wrcf-dashboard.component.css`** → empty file

---

## 2. Dialog components — convert to proper MatDialog

**`publish-draft-dialog.component.ts`** and **`version-history-dialog.component.ts`**
- Inject `MatDialogRef` instead of `output<void>()`
- Add imports: `MatDialogModule`, `MatButtonModule`, `MatIconModule`
- Template: use `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`
- Replace close button with `<button mat-icon-button mat-dialog-close><mat-icon svgIcon="heroicons_outline:x-mark"/></button>`
- Remove inline `styles` arrays; replace with Tailwind classes

---

## 3. NavDrawerComponent

**`nav-drawer.component.ts`**
- Add imports: `MatIconModule`, `MatButtonModule`
- Migrate `@Input`/`@Output` to `input()`/`output()` (Angular 21 signal style)

**`nav-drawer.component.html`**
- Replace close button text with `<mat-icon svgIcon="heroicons_outline:x-mark">`
- Replace all inline `<svg>` nav icons with `<mat-icon svgIcon="heroicons_outline:...">`
- Replace CSS classes with Tailwind utilities

**`nav-drawer.component.css`** → empty file

---

## 4. Icon mapping

| Current SVG | heroicons_outline name |
|---|---|
| hamburger menu | `bars-3` |
| check mark | `check` |
| clock | `clock` |
| chevron down | `chevron-down` |
| 4 squares | `squares-2x2` |
| building/house | `building-office` |
| star | `star` |
| users | `users` |
| user circle | `user` |
| close/X | `x-mark` |
| document | `document-text` |
| document + plus | `document-plus` |

---

## 5. Files to modify

| File | Change |
|---|---|
| `wrcf-dashboard.component.ts` | Add Material imports, FormControls, MatDialog, remove dialog signals |
| `wrcf-dashboard.component.html` | Full Tailwind + Material rewrite |
| `wrcf-dashboard.component.css` | Empty |
| `publish-draft-dialog.component.ts` | Convert to MatDialog, Tailwind styles |
| `version-history-dialog.component.ts` | Convert to MatDialog, Tailwind styles |
| `nav-drawer.component.ts` | Add Material imports, signal-based I/O |
| `nav-drawer.component.html` | Replace SVGs with mat-icon, Tailwind classes |
| `nav-drawer.component.css` | Empty |
