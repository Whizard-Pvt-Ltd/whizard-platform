# Plan: Loading Bar Service + Interceptor (`@whizard/shared-ui`)

## Context

The admin portal currently has no global progress indicator for in-flight HTTP requests. Users get no visual feedback when the app is waiting on the API (list fetches, saves, uploads). We need a thin top-of-viewport progress bar that shows automatically for every outgoing HTTP call and hides once all in-flight requests finish.

Exploration confirmed no existing loading-bar implementation in `libs/shared/ui` — building from scratch, signal-based, aligned with the repo's Angular 19 + standalone component conventions (see `ToasterService` at `libs/shared/ui/src/toaster/toaster.service.ts`).

## Approach

Three pieces, all under `libs/shared/ui/src/loading/`:

1. **`LoadingService`** — signal-based state holder. Tracks a `Map<url, true>` of in-flight requests. When size > 0 → `show = true`; when size drops to 0 → `show = false`. Also exposes manual `show()` / `hide()` / `setAutoMode()` / `setMode()` / `setProgress()` for callers that want to drive the bar directly (e.g. a long-running non-HTTP task).
2. **`loadingInterceptor`** — functional `HttpInterceptorFn`. On request: `_setLoadingStatus(true, req.url)`. On `finalize` (success or error): `_setLoadingStatus(false, req.url)`. Bypasses if `auto$` is `false`.
3. **`LoadingBarComponent`** — presentational. Reads `show$` / `mode$` / `progress$` signals. Renders a fixed, 3px-tall bar at the top of its container (positioned by the layout). Uses Angular Material's `MatProgressBar` under the hood so determinate/indeterminate modes come for free, themed to the WRCF `accent` (`#00BFFF`) color.

### Architecture

```
HTTP request ──► loadingInterceptor ──► LoadingService
                                              │ signal<boolean> show$
                                              ▼
                                       LoadingBarComponent
                                       (mounted in AdminLayoutComponent)
```

Key decisions:

- **Signals over RxJS**: matches `ToasterService` / `PageActionsService` convention. Fuse uses `BehaviorSubject`; we translate to `signal<T>`.
- **Functional interceptor** (`HttpInterceptorFn`), not class-based — matches the existing `authInterceptor` (`apps/web/admin-portal/src/app/core/interceptors/auth.interceptor.ts`) and plugs into `withInterceptors([...])`.
- **Map keyed by URL, not request id**: mirrors Fuse. Two parallel requests to the same URL collapse into one map entry — acceptable because both finish before `show` flips off (the second `delete` is a no-op, but the interceptor only calls `_setLoadingStatus(false)` after both responses finalize). In practice, the same URL fired twice in parallel is rare; if it becomes a problem, switch to a counter per URL.
- **Mount point**: inside `AdminLayoutComponent` template, absolutely positioned at the top of `<mat-sidenav-content>` (above the top bar). One instance per app — every portal that uses the shared layout gets it for free.
- **Auto mode on by default**: `auto$ = true`. Pages that want to opt out of auto-handling for a specific flow can call `loadingService.setAutoMode(false)` temporarily.
- **Standalone component**, `ChangeDetectionStrategy.OnPush`, no module wiring.

### Public API

```ts
type LoadingMode = 'determinate' | 'indeterminate';

class LoadingService {
  readonly show$: Signal<boolean>;
  readonly mode$: Signal<LoadingMode>;
  readonly progress$: Signal<number>;
  readonly auto$: Signal<boolean>;

  show(): void;
  hide(): void;
  setAutoMode(value: boolean): void;
  setMode(value: LoadingMode): void;
  setProgress(value: number): void; // 0–100

  /** Used by the interceptor — prefix with _ to signal "internal". */
  _setLoadingStatus(status: boolean, url: string): void;
}

export const loadingInterceptor: HttpInterceptorFn;

@Component({ selector: 'whizard-loading-bar', standalone: true, ... })
export class LoadingBarComponent { /* reads service signals */ }
```

Usage from any component (optional — auto mode handles most cases):

```ts
private readonly loading = inject(LoadingService);
// Manual control for a long non-HTTP task:
this.loading.setMode('determinate');
this.loading.show();
this.loading.setProgress(42);
this.loading.hide();
```

## Files to create

All under `libs/shared/ui/src/loading/`:

| File                         | Purpose                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `loading.service.ts`       | `LoadingService` with `signal`-backed state + URL map                    |
| `loading.interceptor.ts`   | `loadingInterceptor: HttpInterceptorFn` — toggles status via `finalize` |
| `loading-bar.component.ts` | Presentational bar, reads service signals, wraps `MatProgressBar`          |
| `index.ts`                 | Barrel for the loading folder                                                |

## Files to modify

1. **`libs/shared/ui/src/index.ts`** — add exports:

   ```ts
   export { LoadingService } from './loading/loading.service.js';
   export type { LoadingMode } from './loading/loading.service.js';
   export { loadingInterceptor } from './loading/loading.interceptor.js';
   export { LoadingBarComponent } from './loading/loading-bar.component.js';
   ```

   (`.js` extension to match existing barrel convention.)
2. **`libs/shared/ui/src/layout/layout.component.ts`** — import `LoadingBarComponent`, add it to the `imports` array, and drop `<whizard-loading-bar />` inside `<mat-sidenav-content>` as the first child so it pins to the top of the content area (above the 64px top bar).
3. **`apps/web/admin-portal/src/app/app.config.ts`** — add `loadingInterceptor` to the interceptor chain:

   ```ts
   import { loadingInterceptor } from '@whizard/shared-ui';
   // ...
   provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor])),
   ```

   Order doesn't matter for correctness (both are independent), but placing `loadingInterceptor` last means its `finalize` fires after the auth header has been attached — closer to actual network completion.

## Styling notes

- Bar height: 3px, full width of `<mat-sidenav-content>`, positioned at top via absolute positioning inside a `position: relative` wrapper — or simply `position: sticky; top: 0; z-index: 50`.
- Color: WRCF `accent` (`#00BFFF`) for the fill, transparent track. Override `MatProgressBar` via `::ng-deep` scoped to the component (or CSS custom properties on `.mat-mdc-progress-bar`).
- Visibility: `@if (loading.show$()) { <mat-progress-bar ... /> }` — simple conditional, no fade animation in v1.
- Indeterminate mode by default; determinate only when a caller opts in via `setMode('determinate')` + `setProgress(...)`.

## Verification

1. **Type check / build**
   ```bash
   pnpm build:web-admin
   ```
2. **Runtime smoke test** — start the admin portal:
   ```bash
   pnpm start:web-admin
   ```

   Navigate to any list page that fetches data (e.g. manage-internship). Confirm:- Bar appears at the top of the content area as soon as the request fires.
   - Bar disappears once all in-flight requests finish.
   - Firing two parallel requests keeps the bar visible until the last one finishes.
   - A failed request (throw/4xx/5xx) still hides the bar (`finalize` guarantees it).
   - Auto mode off (`loadingService.setAutoMode(false)`) → bar no longer auto-triggers on requests.
3. **Lint**
   ```bash
   pnpm lint
   ```

## Out of scope

- Per-page / scoped loading bars (only a single global bar).
- Excluding specific URLs from auto-tracking (e.g. polling endpoints that would keep the bar permanently visible). If this becomes a need, add an `excludeUrls: RegExp[]` setter on the service and check it in the interceptor.
- Fade-in / fade-out animation.
- Progress reporting from `HttpEventType.UploadProgress` / `DownloadProgress` — determinate mode stays manual in v1.
