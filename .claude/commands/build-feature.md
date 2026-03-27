---
description: Scaffold, plan, and build a new feature end-to-end
---

# Build Feature Command

Interactive workflow to scaffold a feature, capture requirements, iterate on an implementation plan, and then build.

## Steps to execute:

### 1. New or existing feature?

Ask the user:
> "Is this a **new** feature or do you have an **existing** feature folder already?"

- If **existing**: Ask for the feature name, derive the hierarchical path (e.g. "WRCF Roles" → `docs/features/wrcf/roles/`), confirm the path with the user, check that it exists, then skip to **Step 4 — Read requirements**.
- If **new**: Continue to Step 2.

### 2. Get the feature name

Ask:
> "What is the name of the feature?"

**Path derivation rules** — the feature name maps to a hierarchical path under `docs/features/`:

- Split the name into logical segments by common prefixes/product areas (e.g. "wrcf dashboard" → `wrcf/dashboard`, "user onboarding" → `user/onboarding`, "wrcf roles" → `wrcf/roles`).
- Each segment is lowercased and hyphenated (spaces → hyphens, strip special characters).
- If the name is a single standalone word with no clear parent, use it directly as a flat folder.

Examples:
- "WRCF Dashboard" → `docs/features/wrcf/dashboard/`
- "WRCF Roles" → `docs/features/wrcf/roles/`
- "User Onboarding" → `docs/features/user/onboarding/`
- "Billing" → `docs/features/billing/`

**Show the derived path to the user and confirm before creating anything.**
> "I'll scaffold this at `docs/features/wrcf/dashboard/` — does that look right?"

If the user wants a different path, adjust accordingly.

### 3. Scaffold the feature folder

Create the following structure under the confirmed path:

```
docs/features/<path>/
  requirement.txt       ← pre-filled template (see below)
  notes.txt             ← empty placeholder
  UX-screenshots/       ← empty directory (create a .gitkeep inside)
```

Write `requirement.txt` with this template (replace `<Feature Name>` with the actual name):

```
# <Feature Name>

## Overview
<!-- One paragraph: what this feature does and why it exists. -->

## Default Behaviours
<!-- Auto-select rules, pre-population, initial state.
     e.g. "Select first sector/industry on load", "Pre-fill form with last used value" -->

## Entities & Attributes
<!-- One sub-section per entity. For each field: Name, Type, Mandatory (*), Options if dropdown. -->

### <Entity 1>
- Field Name* — Type (e.g. Text, Number, Dropdown: Option A / Option B)

### <Entity 2>
- Field Name — Type

## User Flows
<!-- Step-by-step flows the user goes through.
     e.g. "1. Select department → 2. Click + Role → 3. Fill form → 4. Save" -->

## Business Rules & Constraints
<!-- Validation rules, cascading restrictions, guard conditions.
     e.g. "Cannot create Role unless a Department is selected" -->

## DB Notes
<!-- Tables needed, key columns, relationships, audit fields (created_by, created_on etc.) -->

## Scope
<!-- Explicit list of what must be built: frontend, API, migration, tests. -->

## Out of Scope
<!-- Anything explicitly NOT part of this feature to avoid scope creep. -->

## Notes / Edge Cases
<!-- Gotchas, open questions, cross-feature dependencies. -->
```

Write `notes.txt` as an empty file. For `UX-screenshots/.gitkeep` write an empty file.

Then tell the user:
> "Feature folder created at `docs/features/<path>/`.
>
> Fill in `docs/features/<path>/requirement.txt` — a template with sections is already there to guide you.
>
> Drop any UX screenshots into `docs/features/<path>/UX-screenshots/`.
>
> When you're ready, reply **proceed**."

### 4. Wait for "proceed"

Do not read the file or build the plan until the user says **proceed** (or "go", "done", "ready").

### 5. Read requirements

Read `docs/features/<feature_name>/requirement.txt` in full.
Also read `docs/features/<feature_name>/notes.txt` if it has content.

**UX screenshots (mandatory):** List all files in `docs/features/<feature_name>/UX-screenshots/` and read every image found. Treat the screenshots as the authoritative source of truth for layout, colours, typography, component structure, and interaction patterns. If screenshots conflict with the written requirements, flag the discrepancy and default to the screenshot unless told otherwise.

### 6. Build an implementation plan

Analyse the requirements and the codebase (read relevant existing files) to produce a detailed implementation plan covering:

1. **Data model** — new Prisma models or schema changes needed, following project naming conventions
2. **Domain layer** — aggregates, value objects, repository interfaces (in `libs/contexts/`)
3. **Application layer** — commands, command handlers, query handlers
4. **Infrastructure layer** — Prisma repository implementations
5. **API layer** — Core API routes (Fastify) + BFF proxy routes
6. **Frontend** — Angular components, services, routing changes
7. **Tests** — unit tests to write
8. **Files to create / files to modify** — exhaustive list with purpose

Present the plan clearly to the user. Ask:
> "Does this plan look right? Any changes, missing pieces, or different approach you'd like?"

### 7. Iterate on the plan

Repeat Step 6 with revisions until the user explicitly **approves** the plan (e.g. "looks good", "approved", "go ahead", "build it").

### 8. Save the approved plan

Write the final approved plan to:
```
docs/features/<feature_name>/implementation-plan.md
```

Tell the user:
> "Plan saved to `docs/features/<feature_name>/implementation-plan.md`. Starting implementation now."

### 9. Build the feature

Execute the implementation plan step by step, following all project conventions from CLAUDE.md:
- pnpm monorepo, DDD layer rules, WRCF Design System v3.2 for UI
- DB table naming: plural snake_case entities, alphabetical `entity1_entity2` mapping tables
- No documentation files, sparse comments
- Always include `userId` and `tenantId` in log context

**UI implementation:** When building any Angular page or component, re-read the UX screenshots before writing the template and styles. Reproduce the design pixel-faithfully — layout, colours, card structure, typography scale, spacing, and interactive states must all match the screenshot. Do not invent UI that isn't in the screenshot.

After completing each major step (e.g. Prisma schema, domain layer, API routes, Angular page), briefly summarise what was done and continue to the next step without waiting for confirmation — unless a decision is needed.
