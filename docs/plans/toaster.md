# Plan: Toaster Service + Component (`@whizard/shared-ui`)

## Context

The admin portal currently has no way for components to surface transient feedback messages (success, error, warning, info). We need a reusable, injectable toaster service that any component can call (e.g. `toaster.showSuccess('Changes saved')`) and have the corresponding toast render on screen. The visual spec comes from Figma node `3116:89457` (Latest Whizard Web Design System → Toast Component), which defines four variants:

| Variant | BG        | Border/Icon | Icon  |
|---------|-----------|-------------|-------|
| Error   | `#ffcfcf` | `#f04349`   | ⚠     |
| Success | `#cfffd0` | `#01e17b`   | ✓     |
| Warning | `#feffcf` | `#fdcd0f`   | i     |
| Info    | `#cfdcff` | `#4b85f5`   | i     |

Each toast: 400×50px, `border-radius: 12px`, shadow `0 16px 20px -8px rgba(3,5,18,.1)`, 16/12px padding, 12px gap, 32px icon container (inner 24px colored rounded square with a 24px white glyph), body text `#28292a` Red Hat Display, and a close (×) affordance.

Exploration confirmed **no existing toast/snackbar implementation** in the repo — building from scratch.

## Approach

Build a **signal-based `ToasterService`** plus a single **`ToasterContainerComponent`** mounted once at the app layout root. The container observes the service's `toasts` signal and renders one `ToastComponent` per active toast. Both live in `libs/shared/ui` so every portal (admin/company/student/college) can reuse them.

### Architecture

```
ToasterService  ──(signal<Toast[]>)──►  ToasterContainerComponent
       ▲                                         │
       │ show*()                                 │ @for
  any component                            ToastComponent (variant)
```

Key decisions:

- **State container**: `signal<Toast[]>([])` in the service — matches the convention used by `PageActionsService` (`libs/shared/ui/src/layout/page-actions.service.ts:11-22`). No RxJS needed.
- **DI style**: `@Injectable({ providedIn: 'root' })` → tree-shakeable singleton, no manual provider wiring in `app.config.ts`.
- **Mount point**: render `<whizard-toaster-container>` exactly once inside `AdminLayoutComponent` template (`libs/shared/ui/src/layout/layout.component.ts`) as a fixed-position overlay (top-right, `z-index: 9999`). Every portal that already uses `AdminLayoutComponent` gets toasts for free.
- **Standalone components**: Angular 21, `standalone: true` — consistent with the rest of the repo.
- **Auto-dismiss**: default 4000ms, cancellable by passing `{ duration: 0 }` (persistent) or a custom duration. Implemented with `setTimeout` stored on the toast record so `dismiss(id)` can clear it.
- **Dismissal**: close button calls `toasterService.dismiss(id)`; service mutates the signal by filtering out the id.
- **Unique ids**: incrementing counter inside the service — sufficient for UI keys.

### Public API

```ts
interface ToastOptions {
  duration?: number;         // ms, default 4000, 0 = persistent
  dismissible?: boolean;     // default true — shows close X
}

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  dismissible: boolean;
}

class ToasterService {
  readonly toasts: Signal<readonly Toast[]>;
  show(message: string, variant: ToastVariant, options?: ToastOptions): number;
  showSuccess(message: string, options?: ToastOptions): number;
  showError(message: string, options?: ToastOptions): number;
  showWarning(message: string, options?: ToastOptions): number;
  showInfo(message: string, options?: ToastOptions): number;
  dismiss(id: number): void;
  clear(): void;
}
```

Usage from any component:

```ts
private readonly toaster = inject(ToasterService);
// ...
this.toaster.showSuccess('Changes saved successfully.');
this.toaster.showError('Failed to save changes. Please try again.');
```

## Files to create

All under `libs/shared/ui/src/toaster/`:

| File | Purpose |
|---|---|
| `toaster.types.ts` | `Toast`, `ToastVariant`, `ToastOptions` interfaces |
| `toaster.service.ts` | `ToasterService` with `signal<Toast[]>` + show/dismiss/clear |
| `toast.component.ts` | Presentational single toast (inputs: `toast`, output: `dismiss`) — implements Figma variant styling |
| `toaster-container.component.ts` | Fixed overlay, `@for` over `toasterService.toasts()` |
| `index.ts` | Barrel for the toaster folder |

## Files to modify

1. **`libs/shared/ui/src/index.ts`** — add exports:
   ```ts
   export { ToasterService } from './toaster/toaster.service.js';
   export { ToasterContainerComponent } from './toaster/toaster-container.component.js';
   export { ToastComponent } from './toaster/toast.component.js';
   export type { Toast, ToastVariant, ToastOptions } from './toaster/toaster.types.js';
   ```
   (Keep the `.js` extension to match the existing barrel convention.)

2. **`libs/shared/ui/src/layout/layout.component.ts`** — add `<whizard-toaster-container />` to the template root and include `ToasterContainerComponent` in the `imports` array. No changes to `app.config.ts` since the service is `providedIn: 'root'`.

## Styling notes

- Use the existing WRCF token stack (`libs/shared/theme/src/styles/tailwind/theme.css`) for font family (`--font-*` → Red Hat Display) and text sizing. The four semantic background / border hexes from Figma are toast-specific, not in the global token system — declare them as CSS custom properties scoped to the toast element so they don't leak:
  ```scss
  .whizard-toast--success { --toast-bg: #cfffd0; --toast-border: #01e17b; }
  .whizard-toast--error   { --toast-bg: #ffcfcf; --toast-border: #f04349; }
  .whizard-toast--warning { --toast-bg: #feffcf; --toast-border: #fdcd0f; }
  .whizard-toast--info    { --toast-bg: #cfdcff; --toast-border: #4b85f5; }
  ```
- Container positioning: `position: fixed; top: 24px; right: 24px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; pointer-events: none;` — each toast re-enables `pointer-events: auto`.
- Icons: lucide set via `@whizard/icons` (`lucideIcons` namespace) — `circle-check`, `circle-alert`, `triangle-alert`, `info`, `x`.
- Enter animation: simple `transform: translateX(100%) → 0` + `opacity 0 → 1` over 180ms. Exit: reverse. CSS-only (no Angular animations module).

## Verification

1. **Type check / build**
   ```bash
   pnpm build:web-admin
   ```
2. **Runtime smoke test** — start the admin portal:
   ```bash
   pnpm start:web-admin
   ```
   In any existing page component, temporarily wire a button to call each of `showSuccess`, `showError`, `showWarning`, `showInfo` and confirm:
   - Visual parity with Figma (colors, radius, shadow, icon square, typography).
   - Stacking: firing multiple toasts stacks them top-to-bottom with 12px gap.
   - Auto-dismiss after 4s; close button dismisses immediately; `duration: 0` persists.
   - No console errors; service is injectable without extra providers in `app.config.ts`.
3. **Lint**
   ```bash
   pnpm lint
   ```
4. Revert the temporary test wiring before committing.

## Out of scope

- Action buttons inside toasts (e.g. "Undo") — can be added later as an optional `action?: { label; handler }` field.
- Accessibility roles beyond `role="status"` / `aria-live="polite"` on the container.
- i18n of default messages — callers always pass their own strings.
