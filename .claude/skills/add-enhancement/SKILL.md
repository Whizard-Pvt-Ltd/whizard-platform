---
description: Scaffold, plan, and build an enhancement to an existing feature end-to-end
---

# Add Enhancement Command

Interactive workflow to scaffold an enhancement, capture requirements, iterate on an implementation plan, and then build.

## Steps to execute:

### 1. New or existing enhancement?

Ask the user:
> "Is this a **new** enhancement or do you have an **existing** enhancement folder already?"

- If **existing**: Ask for the enhancement name, derive the hierarchical path (e.g. "WRCF Dashboard Filters" → `docs/enhancements/wrcf/dashboard-filters/`), confirm the path with the user, check that it exists, then skip to **Step 4 — Read requirements**.
- If **new**: Continue to Step 2.

### 2. Get the enhancement name

Ask:
> "What is the name of the enhancement?"

**Path derivation rules** — the enhancement name maps to a hierarchical path under `docs/enhancements/`:

- Split the name into logical segments by common prefixes/product areas (e.g. "wrcf dashboard filters" → `wrcf/dashboard-filters`, "roles export" → `roles/export`).
- Each segment is lowercased and hyphenated (spaces → hyphens, strip special characters).
- If the name is a single standalone word with no clear parent, use it directly as a flat folder.

Examples:
- "WRCF Dashboard Filters" → `docs/enhancements/wrcf/dashboard-filters/`
- "Roles Export" → `docs/enhancements/roles/export/`
- "Signup UX" → `docs/enhancements/signup/ux/`
- "Pagination" → `docs/enhancements/pagination/`

**Show the derived path to the user and confirm before creating anything.**
> "I'll scaffold this at `docs/enhancements/wrcf/dashboard-filters/` — does that look right?"

If the user wants a different path, adjust accordingly.

### 3. Scaffold the enhancement folder

Create the following structure under the confirmed path:

```
docs/enhancements/<path>/
  requirement.txt       ← pre-filled template (see below)
  notes.txt             ← empty placeholder
  UX-screenshots/       ← empty directory (create a .gitkeep inside)
```

Write `requirement.txt` with this template (replace `<Enhancement Name>` with the actual name):

```
# <Enhancement Name>

## Overview
<!-- One paragraph: what this enhancement does, which existing feature it improves, and why. -->

## Current Behaviour
<!-- Describe how the feature works today before this enhancement. -->

## Desired Behaviour
<!-- Describe how it should work after the enhancement. Be specific. -->

## Default Behaviours
<!-- Auto-select rules, pre-population, initial state changes if any. -->

## Changes to Entities & Attributes
<!-- Only list fields/entities that are added, changed, or removed.
     For each: Name, Type, Mandatory (*), Options if dropdown. -->

## User Flows
<!-- Step-by-step flows that change or are newly introduced.
     e.g. "1. Click Export → 2. Choose format → 3. Download file" -->

## Business Rules & Constraints
<!-- New or changed validation rules, guard conditions, cascading effects. -->

## DB Notes
<!-- New columns, indexes, or table changes needed. State "No DB changes" if none. -->

## Scope
<!-- Explicit list of what must be changed: frontend, API, migration, tests. -->

## Out of Scope
<!-- Anything explicitly NOT part of this enhancement to avoid scope creep. -->

## Notes / Edge Cases
<!-- Gotchas, open questions, cross-feature dependencies. -->
```

Write `notes.txt` as an empty file. For `UX-screenshots/.gitkeep` write an empty file.

Then tell the user:
> "Enhancement folder created at `docs/enhancements/<path>/`.
>
> Fill in `docs/enhancements/<path>/requirement.txt` — a template with sections is already there to guide you.
>
> Drop any UX screenshots into `docs/enhancements/<path>/UX-screenshots/`.
>
> When you're ready, reply **proceed**."

### 4. Wait for "proceed"

Do not read the file or build the plan until the user says **proceed** (or "go", "done", "ready").

### 5. Read requirements

Read `docs/enhancements/<path>/requirement.txt` in full.
Also read `docs/enhancements/<path>/notes.txt` if it has content.

**UX screenshots (mandatory):** List all files in `docs/enhancements/<path>/UX-screenshots/` and read every image found. Treat the screenshots as the authoritative source of truth for layout, colours, typography, component structure, and interaction patterns. If screenshots conflict with the written requirements, flag the discrepancy and default to the screenshot unless told otherwise.

### 6. Explore existing code

Before planning, read the relevant existing files that this enhancement touches. Understand:
- Which components, services, or handlers will change
- What the current data flow looks like
- Any patterns already established that the enhancement should follow

### 7. Build an implementation plan

Analyse the requirements and the existing code to produce a focused implementation plan. Since this is an enhancement (not a new feature), emphasise **what changes** rather than what gets created from scratch. Cover:

1. **Data model** — schema changes, new columns, or indexes (if any)
2. **Domain / Application layer** — changes to existing aggregates, handlers, or new ones needed
3. **Infrastructure layer** — repository changes
4. **API layer** — new or modified Core API routes + BFF proxy routes
5. **Frontend** — changes to existing Angular components, services, or new ones needed
6. **Tests** — unit tests to add or update
7. **Files to modify / files to create** — exhaustive list with the specific change for each

Present the plan clearly to the user. Ask:
> "Does this plan look right? Any changes, missing pieces, or different approach you'd like?"

### 8. Iterate on the plan

Repeat Step 7 with revisions until the user explicitly **approves** the plan (e.g. "looks good", "approved", "go ahead", "build it").

### 9. Save the approved plan

Write the final approved plan to:
```
docs/enhancements/<path>/implementation-plan.md
```

Tell the user:
> "Plan saved to `docs/enhancements/<path>/implementation-plan.md`. Starting implementation now."

### 10. Build the enhancement

Execute the implementation plan step by step, following all project conventions from CLAUDE.md:
- pnpm monorepo, DDD layer rules, WRCF Design System v3.2 for UI
- DB table naming: plural snake_case entities, alphabetical `entity1_entity2` mapping tables
- No documentation files, sparse comments
- Always include `userId` and `tenantId` in log context

**UI implementation:** When modifying any Angular page or component, re-read the UX screenshots before writing the template and styles. Match the design precisely — layout, colours, card structure, typography scale, spacing, and interactive states must all match the screenshot. Do not invent UI that isn't in the screenshot.

After completing each major step (e.g. schema change, handler update, Angular component), briefly summarise what was done and continue to the next step without waiting for confirmation — unless a decision is needed.
