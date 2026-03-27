# Action Plan: `@whizard/icons` & `@whizard/theme` Shared Libraries

**Date:** 2026-03-27
**Branch:** `node24-angular21-upgrade`

---

## Overview

Extracted icon registration and theming concerns out of the `admin-portal` app into two dedicated shared libraries. This keeps app-level bootstrap code thin and makes both capabilities reusable across any Angular app in the monorepo.

---

## 1. `libs/shared/icons` — `@whizard/icons`

### Goal
Bundle all Heroicons SVG icon sets as inlined TypeScript literals and expose a single `provideIcons()` function that registers them with Angular Material's `MatIconRegistry` at app startup — no HTTP requests, no asset configuration.

### Steps Completed

#### 1.1 — Scaffold library
Created the library under `libs/shared/icons/` with:
- `project.json` — Nx project definition, tags `type:shared scope:ui`, Vitest + ESLint targets
- `tsconfig.json` / `tsconfig.lib.json` — extends `tsconfig.base.json` with strict Angular compiler options
- `eslint.config.cjs`

#### 1.2 — Add icon sets
Created three TypeScript files under `src/lib/icon-sets/`:

| File | Namespace | Size |
|---|---|---|
| `heroicons-outline.ts` | `heroicons_outline` | 24×24 stroke |
| `heroicons-solid.ts` | `heroicons_solid` | 24×24 fill |
| `heroicons-mini.ts` | `heroicons_mini` | 20×20 fill |

Each file exports a single `const` string containing the full SVG sprite for its set.

#### 1.3 — Implement `provideIcons()`
`src/lib/icons.provider.ts` — returns `EnvironmentProviders` via `makeEnvironmentProviders`. Registers all three icon namespaces inside a `provideAppInitializer` callback:

```ts
provideIcons(): EnvironmentProviders
```

Uses `DomSanitizer.bypassSecurityTrustHtml()` to inline SVG sprites safely.

#### 1.4 — Barrel export
`src/index.ts` exports `provideIcons`.

#### 1.5 — Register path alias
Added to `tsconfig.base.json`:
```json
"@whizard/icons": ["libs/shared/icons/src/index.ts"]
```

#### 1.6 — Wire into admin-portal
`app.config.ts`:
```ts
import { provideIcons } from '@whizard/icons';
// ...
provideIcons(),
```

### Template usage (post-setup)
```html
<mat-icon svgIcon="heroicons_outline:home"></mat-icon>
<mat-icon svgIcon="heroicons_solid:check"></mat-icon>
<mat-icon svgIcon="heroicons_mini:x-mark"></mat-icon>
```

---

## 2. `libs/shared/theme` — `@whizard/theme`

### Goal
Centralise the WRCF design system: CSS stylesheets, dynamic tonal palette generation, and the theming service/provider. Deleted the scattered files from `admin-portal/src/app/core/theming/` and `admin-portal/src/styles/`.

### Steps Completed

#### 2.1 — Scaffold library
Created the library under `libs/shared/theme/` with:
- `project.json` — Nx project definition, tags `type:shared scope:ui`, Vitest (`tsconfig.spec.json`) + ESLint targets
- `tsconfig.json` / `tsconfig.lib.json` / `tsconfig.spec.json` — strict Angular compiler options + Vitest spec config
- `vite.config.mts` — Vitest config for unit tests
- `eslint.config.cjs`
- `src/test-setup.ts`

#### 2.2 — Move & reorganise stylesheets
All CSS moved from `admin-portal/src/styles/` into `libs/shared/theme/src/styles/`:

```
styles/
  theme.css                      ← single entry-point, @imports everything below
  base/
    base.css                     ← resets, scrollbar, body defaults
    typography.css               ← Poppins font + heading/body scale
  tailwind/
    theme.css                    ← CSS custom properties mapped to Tailwind tokens
    variants.css                 ← .scheme-dark / .scheme-light variant definitions
    utilities.css                ← custom Tailwind utility classes
  components/
    a.css                        ← anchor link overrides
    input.css                    ← Material input overrides
    kbd.css                      ← <kbd> styling
    material.css                 ← Angular Material component overrides
  third-party/
    lucide-icons.css             ← Lucide icon size/alignment normalisation
```

`theme.css` is the single entry-point that `@import`s all sub-files in the correct order (Tailwind extensions → base → components → third-party).

#### 2.3 — Implement `TonalPalette`
`src/lib/palette.ts` — generates an 11-stop tonal color palette (50–950) from any hex color.

- Uses **chroma-js** for color manipulation
- Uses **HSLuv** for perceptual lightness distribution (default mode: `perceived`)
- Supports `linear` mode for direct HSL manipulation
- Outputs both `hex` and `oklch` formats
- `hue(value)` method returns a specific stop

#### 2.4 — Define models
`src/lib/models/theming.ts`:

```ts
type Scheme = 'light' | 'dark' | 'system';
type Colors = { primary: string; error: string };
type ThemeConfig = Colors & { scheme: Scheme };
type Theme = { primary: TonalPalette; error: TonalPalette };
```

#### 2.5 — Implement `ThemingService`
`src/lib/theming.service.ts` — `@Injectable({ providedIn: 'root' })`:

| Signal / Computed | Description |
|---|---|
| `colors` | Active primary + error hex values |
| `scheme` | `light \| dark \| system`, persisted to `localStorage` |
| `theme` | Derived `TonalPalette` pair, recomputed on `colors` change |
| `isDark` / `isLight` | Derived from `scheme` + `prefers-color-scheme` media query |

On each `scheme` change an Angular `effect` toggles `.scheme-dark` / `.scheme-light` on `<html>` and sets `color-scheme`.

On `system` scheme, a `matchMedia` listener keeps the classes in sync when the OS preference changes.

CSS custom properties (`--theme-color-primary-*`, `--theme-color-error-*`) are injected into a `<style class="theme-colors">` element appended to `<head>`.

#### 2.6 — Implement `provideTheming()`
`src/lib/provider.ts`:

```ts
export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

provideTheming(config: ThemeConfig): EnvironmentProviders
```

Provides `THEME_CONFIG` and eagerly instantiates `ThemingService` via `provideAppInitializer`.

#### 2.7 — Barrel export
`src/index.ts` exports:
- `provideTheming`, `THEME_CONFIG`
- `ThemingService`
- Types: `Scheme`, `Theme`, `ThemeConfig`, `Colors`
- `TonalPalette`

#### 2.8 — Register path alias
Added to `tsconfig.base.json`:
```json
"@whizard/theme": ["libs/shared/theme/src/index.ts"]
```

#### 2.9 — Wire into admin-portal
`app.config.ts`:
```ts
import { provideTheming } from '@whizard/theme';
// ...
provideTheming({
  scheme: 'system',
  primary: '#4f46e5',
  error: '#dc2626',
}),
```

`styles.css`:
```css
@import 'tailwindcss';
@import '@angular/cdk/overlay-prebuilt.css';
@import '../../../../libs/shared/theme/src/styles/theme.css';
```

#### 2.10 — Delete app-local files
Removed from `admin-portal`:
- `src/app/core/theming/` (entire directory — `index.ts`, `models/theming.ts`, `provider.ts`, `theming.service.ts`)
- `src/styles/base/base.css`
- `src/styles/base/typography.css`
- `src/styles/components/material.css`
- `src/styles/tailwind/theme.css`
- `src/styles/tailwind/variants.css`

---

## Files Changed Summary

| Path | Change |
|---|---|
| `libs/shared/icons/` | Created — full library |
| `libs/shared/theme/` | Created — full library |
| `tsconfig.base.json` | Added `@whizard/icons` and `@whizard/theme` path aliases |
| `apps/web/admin-portal/src/app/app.config.ts` | Added `provideIcons()` + `provideTheming(...)` |
| `apps/web/admin-portal/src/styles.css` | Replaced inline styles with `@import` of `theme.css` |
| `apps/web/admin-portal/src/app/core/theming/` | Deleted |
| `apps/web/admin-portal/src/styles/` | Deleted (base, tailwind, components subdirs) |
