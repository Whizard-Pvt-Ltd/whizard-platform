# wrcf-industry.playwright.spec

**Source:** `manual-tests/wrcf-industry.playwright.spec.ts`

## Purpose

UI coverage for `Manage Industry WRCF`, focused on Functional Group, Primary Work Object, and Secondary Work Object behavior.

## Covered Tests

- loads industry context and current WRCF columns
- does not save a functional group with a blank name
- creates a functional group with mandatory name and optional blank description
- allows editing a functional group and saving without changing the name
- supports single quotes in functional group name and description through the UI
- creates a primary work object under the selected functional group
- creates a secondary work object under the selected primary work object
- pending duplicate and prerequisite cases remain in the spec as `fixme`

## Flow Diagram

```text
Login
  -> open /industry-wrcf
  -> select Industry Sector
  -> select Industry
  -> Functional Group column
      -> create/edit/delete FG
      -> select FG
          -> Primary Work Obj. column
              -> create/delete PWO
              -> select PWO
                  -> Secondary Work Obj. column
                      -> create/delete SWO
```

## Notes

- Uses the live WRCF UI
- Keeps some known business-rule gaps as pending `fixme` tests

## Pending Cases And Blockers

- `blocks duplicate functional group names on create`
  Blocker: duplicate FG validation is not clearly implemented or surfaced in the current WRCF flow.
- `blocks duplicate functional group rename on edit`
  Blocker: duplicate FG validation on edit is not clearly implemented or surfaced in the current WRCF flow.
- `blocks whitespace-only duplicate names on create and edit`
  Blocker: whitespace-normalized duplicate handling is not clearly implemented or surfaced in the current WRCF flow.
- `prevents functional group creation before an industry is selected`
  Blocker: the current UI still allows the FG panel to open before industry selection.
