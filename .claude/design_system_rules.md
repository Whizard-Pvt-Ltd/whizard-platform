# Whizard Design System Rules

> Source of truth: [Figma – Latest Whizard Web Design System](https://www.figma.com/design/zVVHwGoayNcFJ7ejiV0T0U/Latest-Whizard-Web-Design-System?node-id=2236-61967&m=dev)

## Token Prefix

All design-system Tailwind tokens use the **`whizard-`** prefix.
Example utility classes: `bg-whizard-bg-main`, `text-whizard-text-primary`, `border-whizard-border`.

Tokens are defined in `libs/shared/theme/src/styles/tailwind/theme.css` inside the `@theme` block.

---

## Color Tokens (light-dark)

Every color supports **light and dark** mode via the CSS `light-dark()` function.
The dark values come directly from Figma; light values are semantic inverses.

| Token (CSS var)                       | Tailwind class suffix         | Dark              | Light       | Usage                                                |
| ------------------------------------- | ----------------------------- | ----------------- | ----------- | ---------------------------------------------------- |
| `--color-whizard-bg-main`           | `whizard-bg-main`           | `#0F172A`       | `#F8FAFC` | Page background                                      |
| `--color-whizard-bg-secondary`      | `whizard-bg-secondary`      | `#0F253F`       | `#F1F5F9` | Fields, dropdowns, hover bg                          |
| `--color-whizard-bg-fields-heading` | `whizard-bg-fields-heading` | `#0F253F`       | `#E2E8F0` | Field group headings bg                              |
| `--color-whizard-bg-card`           | `whizard-bg-card`           | `#1E293B / 70%` | `#E2E8F0` | Card/panel background                                |
| `--color-whizard-bg-selected`       | `whizard-bg-selected`       | `#2D2A5A`       | `#EEF2FF` | Selected item background                             |
| `--color-whizard-action`            | `whizard-action`            | `#314DDF`       | `#314DDF` | Primary buttons, column headers                      |
| `--color-whizard-action-hover`      | `whizard-action-hover`      | `#263FCC`       | `#263FCC` | Button hover                                         |
| `--color-whizard-accent`            | `whizard-accent`            | `#00BFFF`       | `#0284C7` | Secondary buttons, focus rings, selected left border |
| `--color-whizard-text-primary`      | `whizard-text-primary`      | `#E8F0FA`       | `#0F172A` | Body text, titles                                    |
| `--color-whizard-text-secondary`    | `whizard-text-secondary`    | `#7F94AE`       | `#64748B` | Labels, muted text                                   |
| `--color-whizard-text-tertiary`     | `whizard-text-tertiary`     | `#8AB4F8`       | `#3B82F6` | Item codes, helper text                              |
| `--color-whizard-text-gray`         | `whizard-text-gray`         | `#ABB7C2`       | `#94A3B8` | Inactive tab text                                    |
| `--color-whizard-border`            | `whizard-border`            | `#484E5D`       | `#CBD5E1` | All borders and dividers                             |
| `--color-whizard-border-divider`    | `whizard-border-divider`    | `#7F94AE`       | `#E2E8F0` | Divider lines                                        |

### Status Colors (same in both modes)

| Token                                        | Class suffix                         | Value       | Usage                |
| -------------------------------------------- | ------------------------------------ | ----------- | -------------------- |
| `--color-whizard-status-job`               | `whizard-status-job`               | `#00BFFF` | Job status badge     |
| `--color-whizard-status-approved`          | `whizard-status-approved`          | `#28A745` | Requisition approved |
| `--color-whizard-status-rejected`          | `whizard-status-rejected`          | `#DC3545` | Requisition rejected |
| `--color-whizard-status-draft`             | `whizard-status-draft`             | `#007BFF` | Requisition draft    |
| `--color-whizard-status-sent-for-approval` | `whizard-status-sent-for-approval` | `#FFA500` | Sent for approval    |

### Project Type Colors (same in both modes)

| Token                                   | Value       | Usage                |
| --------------------------------------- | ----------- | -------------------- |
| `--color-whizard-type-case-study`     | `#28A745` | Case study badge     |
| `--color-whizard-type-contest`        | `#007BFF` | Contest badge        |
| `--color-whizard-type-research-paper` | `#6F42C1` | Research paper badge |

### Alert Colors (same in both modes)

| Token                            | Value       | Usage                        |
| -------------------------------- | ----------- | ---------------------------- |
| `--color-whizard-alert-green`  | `#4AC97E` | Status/Done/User             |
| `--color-whizard-alert-red`    | `#FF647C` | Red Alert / Warning          |
| `--color-whizard-alert-yellow` | `#FFDD65` | Yellow Alert / Mid priority  |
| `--color-whizard-alert-blue`   | `#5786FD` | Blue Alert / Casual priority |

---

## Typography

| Scale     | Font            | Weight | Size | Line Height |
| --------- | --------------- | ------ | ---- | ----------- |
| H1        | Red Hat Display | 400    | 56px | 72px        |
| H2        | Red Hat Display | 400    | 48px | 64px        |
| H3        | Red Hat Display | 400    | 40px | 48px        |
| H4        | Red Hat Display | 400    | 32px | 40px        |
| H5        | Red Hat Display | 400    | 24px | 32px        |
| H6        | Red Hat Display | 400    | 20px | 32px        |
| Large     | Red Hat Display | 400    | 18px | 24px        |
| Paragraph | Red Hat Display | 400    | 16px | 24px        |
| Small     | Red Hat Display | 400    | 14px | 24px        |
| X-Small   | Red Hat Display | 400    | 12px | 16px        |

Font tokens:

- `--font-whizard-display`: `'Red Hat Display'` — headings
- `--font-whizard-body`: `'Open Sans'` — body text

---

## Form Fields (Angular Material outline)

All `<mat-form-field appearance="outline">` inside the admin portal use the class **`whizard-outline`**.

### Specs (from Figma)

| Property            | Value                                          |
| ------------------- | ---------------------------------------------- |
| Input height        | 48px                                           |
| Border radius       | 8px                                            |
| Background          | `whizard-bg-main` (dark: `#0F172A`)        |
| Border              | 1px solid `whizard-border`                   |
| Label font          | 14px, Medium (500),`whizard-text-primary`    |
| Placeholder font    | 14px, Regular (400),`whizard-text-secondary` |
| Input text          | 14px, Medium (500),`whizard-text-primary`    |
| Padding left        | 16px                                           |
| Field gap           | 20px vertical between fields                   |
| Select chevron      | Right-aligned, 30px from right                 |
| Textarea min-height | 103px                                          |

### Search Bar Specs

| Property      | Value                                        |
| ------------- | -------------------------------------------- |
| Height        | 48px                                         |
| Border radius | 10px                                         |
| Background    | `whizard-bg-secondary` (dark: `#0F253F`) |
| Shadow        | `0px 4px 12px rgba(13,10,44,0.06)`         |
| Icon size     | 24px                                         |
| Placeholder   | 15px,`whizard-text-gray`                   |

### Section Headers (in forms)

| Property    | Value                                           |
| ----------- | ----------------------------------------------- |
| Label text  | Poppins SemiBold, 15px,`whizard-action` color |
| Field label | Poppins Medium, 14px, white/text-primary        |

---

## Component Specs

### Header

- Height: 64px, padding-x: 32px, bg: `whizard-bg-main`

### Buttons

| Variant        | Height | Padding-X | Radius | Background         | Text                     |
| -------------- | ------ | --------- | ------ | ------------------ | ------------------------ |
| Primary (48px) | 48px   | 16px      | 10px   | `whizard-action` | `whizard-text-primary` |
| Primary (40px) | 40px   | 16px      | 10px   | `whizard-action` | `whizard-text-primary` |
| Primary (35px) | 35px   | 16px      | 8px    | `whizard-action` | `whizard-text-primary` |
| Secondary      | 40px   | 16px      | 10px   | `whizard-accent` | `whizard-bg-main`      |
| Icon + Label   | 40px   | 12px      | 10px   | `whizard-action` | `whizard-text-primary` |

### Selection Column / Left Panel

- Width: 466px, radius: 14px, bg: `whizard-bg-main`
- Header: height 56px, bg `whizard-action`, title H6
- Item: height varies, body 14-18px
- Selected: bg `whizard-bg-selected` + 4px left border `whizard-accent`

### Cards (Left Panel)

- Background: `whizard-bg-main`
- Border-top: `white/5` (subtle separator)
- Image: 60x60px, rounded-lg
- Title: 18px semibold, `whizard-text-primary`
- Meta: 14px medium, `whizard-text-secondary`
- Status: 14px medium, `whizard-accent`

### Tab Bar

- Height: 50px
- Active tab: `whizard-text-primary`, 3px bottom indicator `whizard-action`
- Inactive tab: `whizard-text-gray` (#ABB7C2)
- Font: 15px, medium, tracking 0.15px

### Dialog / Side Panel

- Background: `whizard-bg-card`
- Header: height 65px, bg `#06B6D4` (CTA teal), rounded-t 8px
- Header title: Poppins Bold, 19px, white
- Form area: padding 20px, gap 20px between fields

### Toggle Switch

- Width: 47px, Height: 21px
- On: accent color, Off: neutral

### Badges / Chips

- Radius: full (pill)
- Padding: 4px 12px
- Font: 12-14px
- Status colors mapped per status type

---

## Applying light-dark()

When writing CSS custom properties that need to work in both schemes:

```css
--color-whizard-bg-main: light-dark(
  oklch(97.8% 0.005 254.0),   /* light: #F8FAFC */
  oklch(20.8% 0.040 265.8)    /* dark:  #0F172A */
);
```

The app's color scheme is set via `provideTheming({ scheme: 'dark' })` in `app.config.ts`.

---

## Rules for Implementation

1. **Always use token classes** — never hardcode hex values in templates. Use `bg-whizard-bg-main` not `bg-[#0F172A]`.
2. **Form fields** must use `appearance="outline"` with class `whizard-outline`.
3. **Font family** — headings use `font-whizard-display`, body uses `font-whizard-body`.
4. **Selected states** use `bg-whizard-bg-selected` + `border-l-4 border-l-whizard-accent`.
5. **Dividers** use `bg-whizard-border-divider` or `border-whizard-border`.
6. **Status badges** use their specific `whizard-status-*` color tokens.
7. **Section labels** in forms use `text-whizard-action` with font-semibold.
8. **Placeholder text** uses `placeholder:text-whizard-text-secondary`.

---

## Angular Form Rules

1. **Always use Reactive Forms** — use `FormBuilder`, `FormGroup`, `FormArray`, and `FormControl` for all form fields. Never use template-driven forms (`ngModel`) in form pages.
2. **Form structure** — group related controls in `FormGroup`, use `FormArray` for repeatable sections (e.g. screening questions, weekly schedule entries).
3. **Typed forms** — always use typed `FormGroup<T>` or `ReturnType<>` patterns so form values are type-safe.
4. **Angular Matrial —** always use angular matrial to create the form ui.

---

## Tailwind CSS Rules

1. **No inline styles** — never use `style="..."` attributes in templates. All styling must be done via Tailwind utility classes. If a Tailwind class doesn't exist for a needed value, add a custom token to the theme (see below).
2. **No arbitrary pixel values in gaps/spacing** — never use `gap-[86px]`, `mt-[7px]`, `w-[423px]`, etc. with hardcoded pixel values. Instead:
   - Use the nearest Tailwind spacing scale value (e.g. `gap-4`, `mt-2`, `w-full`).
   - If no scale value fits, add a custom spacing token to `libs/shared/theme/src/styles/tailwind/theme.css` inside the `@theme` block, then use it as a class.
   - Example: instead of `gap-[86px]`, add `--spacing-21.5: 86px;` to the theme and use `gap-21.5`.
3. **Use Tailwind's canonical class names** — prefer `bg-linear-to-b` over `bg-gradient-to-b`, `w-55` over `w-[220px]`, `leading-5.25` over `leading-[21px]`, etc. Always use the shortest canonical form when Tailwind supports it.
4. **Font families via Tailwind** — use `font-[family-name:var(--font-whizard-display)]` or define a `font-whizard-display` utility in the theme. Do not write `style="font-family: ..."`.
5. **Colors always via tokens** — never use raw hex values like `text-[#e8f0fa]`. Map to the closest `whizard-*` token class.
