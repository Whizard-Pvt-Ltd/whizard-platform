# Plan: Shared Confirmation Dialog (`@whizard/shared-ui`)

## Overview

A reusable, injectable confirmation dialog service for all Whizard web portals. Any component can call `confirm.open({ ... })` and receive a `MatDialogRef` that resolves with `'confirmed' | 'cancelled' | undefined` via `afterClosed()`. The visual design follows Figma node `3117:89815` (Latest Whizard Web Design System → Dialog Box), with four semantic variants (info, success, warning, error).

Ported and adapted from the Fuse `FuseConfirmationService` pattern (`src/@fuse/services/confirmation`), modernized for Angular 21 standalone + `providedIn: 'root'` + `inject()` + WRCF dark theme + lucide icons (no heroicons).

---

## Location

```
libs/shared/ui/src/confirmation/
├── confirmation.types.ts                       # Config + color unions + result type
├── confirmation.service.ts                     # Injectable service
├── dialog/
│   ├── confirmation-dialog.component.ts        # Standalone component
│   └── confirmation-dialog.component.html      # Template
└── index.ts                                    # Folder barrel
```

Re-exported from `libs/shared/ui/src/index.ts`, consumable as:

```ts
import {
  ConfirmationService,
  WhizardConfirmationConfig,
  ConfirmationDialogResult,
} from '@whizard/shared-ui';
```

---

## Public API

```ts
@Injectable({ providedIn: 'root' })
class ConfirmationService {
  open(
    config?: WhizardConfirmationConfig,
  ): MatDialogRef<ConfirmationDialogComponent, ConfirmationDialogResult>;
}

interface WhizardConfirmationConfig {
  title?: string;
  message?: string;
  icon?: {
    show?: boolean;
    name?: string;                   // lucide svgIcon, e.g. 'lucideIcons:info'
    color?: ConfirmationIconColor;
  };
  actions?: {
    confirm?: { show?: boolean; label?: string; color?: ConfirmationActionColor };
    cancel?:  { show?: boolean; label?: string };
  };
  dismissible?: boolean;
}

type ConfirmationIconColor =
  | 'primary' | 'accent' | 'warn' | 'basic'
  | 'info' | 'success' | 'warning' | 'error';

type ConfirmationActionColor =
  | 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'warn';

type ConfirmationDialogResult = 'confirmed' | 'cancelled' | undefined;
```

### Default config (service)

| Field                 | Default                           |
|-----------------------|-----------------------------------|
| `title`               | `'Confirm action'`                |
| `message`             | `'Are you sure you want to confirm this action?'` |
| `icon.show`           | `true`                            |
| `icon.name`           | `'lucideIcons:triangle-alert'`    |
| `icon.color`          | `'warning'`                       |
| `actions.confirm.label` | `'Confirm'`                     |
| `actions.confirm.color` | `'error'`                       |
| `actions.cancel.label`  | `'Cancel'`                      |
| `dismissible`         | `false`                           |

Caller-supplied fields are merged shallowly with nested keys for `icon`, `actions.confirm`, `actions.cancel` — no `lodash.merge` dependency.

---

## Figma → CSS mapping

Source: Figma node `3117:89815`.

| Layer                       | Spec                                                            |
|-----------------------------|-----------------------------------------------------------------|
| Panel                       | 499×auto, `border-radius: 16px`, `bg: rgba(30,41,59,0.94)`, `shadow: 0 8px 36px rgba(0,0,0,.16)` |
| Header                      | `padding: 24 24 0`, flex row, gap 12                            |
| Icon badge                  | 40×40, `border-radius: 9999px`, tinted bg per variant           |
| Icon glyph                  | 24×24 lucide svgIcon, colored to match variant                  |
| Title                       | Red Hat Display, 19/24, weight 700, `#E8F0FA`                   |
| Close X (when dismissible)  | 32×32 button, lucide `x`, `#7F94AE` → `#E8F0FA` on hover        |
| Body                        | `padding: 10 24 20 76`, aligned past the icon column            |
| Message                     | 14/20, regular, `#7F94AE`, `white-space: pre-wrap`              |
| Actions bar                 | `height: 60`, `padding: 15`, right-aligned, gap 8, `bg: rgba(15,23,42,.6)`, `border-top: 1px solid rgba(72,78,93,.6)` |
| Cancel button               | 100×42, transparent, `border: 1px solid #484E5D`, white text    |
| Confirm button              | 100×42, white text, bg driven by `[data-color]`                 |

### Variant color table

| Variant   | Icon bg / text              | Confirm button bg |
|-----------|-----------------------------|-------------------|
| `info`    | `rgba(0,132,255,.1)` / `#0084FF`  | `#314DDF`      |
| `success` | `rgba(1,225,123,.1)` / `#01E17B`  | `#28A745`      |
| `warning` | `rgba(253,205,15,.12)` / `#FDCD0F` | `#FFA500`     |
| `error`   | `rgba(240,67,73,.1)` / `#F04349`  | `#F04349`      |
| `accent`  | `rgba(49,77,223,.12)` / `#314DDF` | `#00BFFF`      |

### Mat Dialog overrides

Declared with `ViewEncapsulation.None` and the panel class `whizard-confirmation-dialog-panel`:

```scss
.whizard-confirmation-dialog-panel .mat-mdc-dialog-surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  padding: 0 !important;
  overflow: hidden;
}
```

The inner `.whizard-confirmation` element owns the real background/shadow so the Figma `rgba(30,41,59,.94)` tint renders cleanly.

---

## Icons

Lucide-only. Icons are registered via `provideIcons()` in `libs/shared/icons/src/lib/icons.provider.ts`, namespace `lucideIcons` (viewBox `0 0 24 24`). Recommended glyphs:

| Variant   | `icon.name`                    |
|-----------|--------------------------------|
| `info`    | `'lucideIcons:info'`           |
| `success` | `'lucideIcons:circle-check'`   |
| `warning` | `'lucideIcons:triangle-alert'` |
| `error`   | `'lucideIcons:circle-alert'` or `'lucideIcons:octagon-alert'` |
| Close X   | `'lucideIcons:x'` (hard-coded in template) |

---

## Usage

```ts
import { inject } from '@angular/core';
import { ConfirmationService } from '@whizard/shared-ui';

export class SomeComponent {
  private readonly confirm = inject(ConfirmationService);

  deleteItem(id: string): void {
    this.confirm
      .open({
        title: 'Delete item?',
        message: 'This action cannot be undone.',
        icon: { show: true, name: 'lucideIcons:circle-alert', color: 'error' },
        actions: {
          confirm: { label: 'Delete', color: 'error' },
          cancel:  { label: 'Cancel' },
        },
        dismissible: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'confirmed') {
          // perform delete
        }
      });
  }
}
```

### Four Figma variants

```ts
// Info
this.confirm.open({
  title: 'Active Session Found',
  message: "You're already logged in on another device. Continuing here will log you out from the previous session.",
  icon: { show: true, name: 'lucideIcons:info', color: 'info' },
  actions: { confirm: { label: 'Continue', color: 'info' }, cancel: { label: 'Cancel' } },
});

// Error
this.confirm.open({
  title: 'Session Conflict Detected',
  message: 'You are currently logged in on another device or devices. Click "Continue" to end those sessions and continue here.',
  icon: { show: true, name: 'lucideIcons:circle-alert', color: 'error' },
  actions: { confirm: { label: 'Retry', color: 'error' }, cancel: { label: 'Cancel' } },
});

// Warning
this.confirm.open({
  title: 'Another Device is Logged In',
  message: 'Your account is currently active elsewhere.\n Continuing will end that session immediately.',
  icon: { show: true, name: 'lucideIcons:triangle-alert', color: 'warning' },
  actions: { confirm: { label: 'Continue', color: 'warning' }, cancel: { label: 'Cancel' } },
});

// Success
this.confirm.open({
  title: 'Session Switched Successfully',
  message: "Your previous session has been closed. You're now logged in on this device.",
  icon: { show: true, name: 'lucideIcons:circle-check', color: 'success' },
  actions: { confirm: { label: 'Got it', color: 'success' }, cancel: { label: 'Close' } },
});
```

---

## DI & wiring

- Service is `@Injectable({ providedIn: 'root' })` — **no** provider wiring needed in `app.config.ts`.
- Consumers must already have `MatDialog` available via Angular Material imports (the dialog component imports `MatDialogModule` itself).
- Lucide icons require `provideIcons()` to be called once at bootstrap — already present in `apps/web/admin-portal/src/app/app.config.ts:34`.

## Verification

```bash
pnpm build:web-admin
```
Passed ✓ — the confirmation lib compiles clean against Angular 21 and the admin portal build.

End-to-end smoke test: inject `ConfirmationService` into any page component, wire a button to `.open({...}).afterClosed().subscribe(...)` for each of the four variants, and confirm visual parity with the Figma frame.
