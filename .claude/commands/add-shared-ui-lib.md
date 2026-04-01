---
description: Scaffold and wire a new UI component group or component inside libs/shared/ui/
---

# Add Shared UI Component Command

Interactive workflow to add a new component group or individual component inside the existing `@whizard/shared-ui` library at `libs/shared/ui/src/`.

## Context

The shared UI lib is structured as:
```
libs/shared/ui/src/
  index.ts              ← main barrel, re-exports all groups
  <group>/
    index.ts            ← group barrel, re-exports all components in the group
    <component>/
      <component>.component.ts
      <component>.component.html   ← only if user chose external template
      <component>.component.css    ← only if user chose external styles
```

Existing groups: `auth`, `form-controls`, `data-display`, `layout`, `design-system`.

---

## Steps to execute:

### 1. New group or existing group?

Ask the user:
> "Is this a **new** component group (e.g. `navigation`, `feedback`) or an existing one (e.g. `form-controls`, `layout`)?"

- **Existing group**: Ask which group, confirm it exists under `libs/shared/ui/src/<group>/`, then skip to Step 3.
- **New group**: Continue to Step 2.

### 2. Name the new group

Ask:
> "What is the name of the new component group? (lowercase, hyphenated — e.g. `navigation`, `feedback`, `overlays`)"

Show the derived path and confirm:
> "I'll create the group at `libs/shared/ui/src/<group>/` — does that look right?"

Create the directory with an `index.ts` barrel:

```typescript
// libs/shared/ui/src/<group>/index.ts
// <Group> components
```

Then wire it into `libs/shared/ui/src/index.ts` by adding:
```typescript
export * from './<group>/index.js';
```
Remove the corresponding `// export * from './<group>'` comment line if it exists.

If the group folder already has a `.gitkeep`, delete it after creating real files.

### 3. List the components to add

Ask:
> "List the components you want to add to `<group>` (comma-separated). e.g. `text-input, select, checkbox`"

### 4. Template & style strategy

Before scaffolding any files, ask **once** (applies to all components in this batch):

> "For the component template, do you want:
> - **`templateUrl`** — a separate `.html` file (default)
> - **`template`** — inline HTML inside the `.ts` file"

> "For the component styles, do you want:
> - **`styleUrl`** — a separate `.css` file (default)
> - **`styles`** — inline CSS inside the `.ts` file"

Store the two answers as `templateMode` (`external` | `inline`) and `styleMode` (`external` | `inline`).

### 5. Scaffold each component

For each component `<component-name>` in the list, create files under `libs/shared/ui/src/<group>/<component-name>/`:

#### `<component-name>.component.ts`

**If `templateMode = external` AND `styleMode = external`:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-<component-name>',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './<component-name>.component.html',
  styleUrl: './<component-name>.component.css',
})
export class <ComponentName>Component {}
```

**If `templateMode = inline` AND `styleMode = external`:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-<component-name>',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- <ComponentName>Component -->
  `,
  styleUrl: './<component-name>.component.css',
})
export class <ComponentName>Component {}
```

**If `templateMode = external` AND `styleMode = inline`:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-<component-name>',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './<component-name>.component.html',
  styles: [`
    /* <ComponentName>Component styles */
  `],
})
export class <ComponentName>Component {}
```

**If `templateMode = inline` AND `styleMode = inline`:**
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-<component-name>',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- <ComponentName>Component -->
  `,
  styles: [`
    /* <ComponentName>Component styles */
  `],
})
export class <ComponentName>Component {}
```

#### `<component-name>.component.html` ← only if `templateMode = external`

```html
<!-- <ComponentName>Component -->
```

#### `<component-name>.component.css` ← only if `styleMode = external`

```css
/* <ComponentName>Component styles */
```

After creating the files, add the export to the group barrel `libs/shared/ui/src/<group>/index.ts`:
```typescript
export { <ComponentName>Component } from './<component-name>/<component-name>.component.js';
```

### 6. Requirements docs scaffold

Ask the user:
> "Do you want to scaffold a requirements doc for this component group? (yes / no)"

If **yes**, ask:
> "What is the feature path for this group? This will be used as `docs/features/<path>/`. e.g. `auth/login-form`, `dashboard/data-table`"

Create the following structure under `docs/features/<path>/`:

```
docs/features/<path>/
  requirement.txt       ← pre-filled template
  notes.txt             ← empty placeholder
  UX-screenshots/
    .gitkeep            ← empty placeholder so the directory is tracked by git
```

Write `requirement.txt` with this template (replace `<Feature Name>` with a title-cased version of the last segment of `<path>`):

```
Feature: <Feature Name>
Group:    <group>
Path:     libs/shared/ui/src/<group>/
Components: <ComponentName>Component, ...

## Overview
<!-- What does this feature/component do? What problem does it solve? -->

## User Stories
<!-- As a <role>, I want <goal>, so that <reason>. -->

## Acceptance Criteria
<!-- List of testable conditions that must be true for this feature to be complete. -->
- [ ] 

## Design Notes
<!-- Link to Figma, describe visual behaviour, states (empty, loading, error, success). -->

## Edge Cases & Constraints
<!-- What should NOT happen? Known limitations? Browser/device scope? -->

## Open Questions
<!-- Unresolved decisions that need stakeholder input. -->
```

Write `notes.txt` as a completely empty file.

Write `UX-screenshots/.gitkeep` as a completely empty file.

### 7. Confirm and summarise

Tell the user:

> "Added to `@whizard/shared-ui`:
>
> **Group:** `libs/shared/ui/src/<group>/`
> **Template strategy:** `<templateMode>` | **Style strategy:** `<styleMode>`
> **Components:**
> - `<ComponentName>Component` → `import { <ComponentName>Component } from '@whizard/shared-ui';`
>
> _(repeat for each component)_
>
> **Requirements docs:** `docs/features/<path>/` _(if scaffolded)_
>
> Every component is ready to import anywhere in the monorepo."
