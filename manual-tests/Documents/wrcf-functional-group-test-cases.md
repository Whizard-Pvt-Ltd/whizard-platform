# WRCF Functional Group Test Cases

**Date:** March 27, 2026  
**Area:** WRCF -> Functional Group  
**Scope:** Functional Group creation, validation, duplicate prevention, editing, and special-character handling  
**Primary Basis:** Requested business rules for Functional Group behavior  
**Supporting References:** `QATestCaseGeneration.yml`, `Whizard SRS.docx`, `Whizard WRCF Enterprise QA Deep Research Report and End-to-End Test Suite.pdf`

## Purpose

This document captures the first focused batch of Functional Group test cases for WRCF. These cases are written as product-facing test design and are intended to be used for manual execution first, then converted into repeatable UI/API tests.

## Current Repo Alignment

These cases are based on the desired behavior you listed, but the current repo implementation matters for planning:

- The UI requires an Industry selection before Functional Groups can be listed or created from the current page flow.
- The Functional Group panel trims the `Name` and blocks a save if the trimmed value is empty.
- `Description` is optional in the current UI and API flow.
- I did not find Functional Group-specific duplicate prevention or whitespace-normalized duplicate checks in the current create/update handler or Prisma repository.
- I did not find a Functional Group database uniqueness constraint in the current Prisma schema.

Because of that, some cases below are expected business behavior but may currently fail in the product. That is useful: those would become valid defect candidates.

## Test Cases

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|
| TC-FG-VAL-001 | Industry Group prerequisite for create | User is on `Manage Industry WRCF`; no Industry is selected | 1. Open the WRCF page. 2. Leave Industry unselected. 3. Attempt to create a Functional Group. | Functional Group creation is blocked until an Industry is selected. User gets clear guidance that Industry selection is required first. | Validation | High |
| TC-FG-VAL-002 | Name is mandatory on create | Valid Industry is selected; Functional Group create panel is open | 1. Open create Functional Group panel. 2. Leave `Name` blank. 3. Enter or omit Description. 4. Save. | Save is blocked. Functional Group is not created. A clear required-field indication is shown for `Name`. | Validation | High |
| TC-FG-VAL-003 | Description is optional on create | Valid Industry is selected; Functional Group create panel is open | 1. Enter a unique valid Name. 2. Leave `Description` blank. 3. Save. | Functional Group is created successfully with empty or null Description. | Functional | High |
| TC-FG-VAL-004 | Completely blank entry is rejected | Valid Industry is selected; Functional Group create panel is open | 1. Leave `Name` blank. 2. Leave `Description` blank. 3. Save. | Save is blocked. No blank Functional Group is created. | Negative | High |
| TC-FG-DUP-001 | Duplicate name blocked on create | Valid Industry is selected; Functional Group `Call Handling 1` already exists in same Industry scope | 1. Open create Functional Group panel. 2. Enter `Call Handling 1` as Name. 3. Save. | System blocks creation of a second Functional Group with the same effective name in the same allowed scope. | Negative | Critical |
| TC-FG-DUP-002 | Duplicate name blocked on edit | Two Functional Groups already exist: `Call Handling 1` and `Call Handling 2` | 1. Edit `Call Handling 2`. 2. Change Name to `Call Handling 1`. 3. Save. | Save is blocked. Existing Functional Group name remains unchanged. Duplicate error is shown. | Negative | Critical |
| TC-FG-DUP-003 | Whitespace-only duplicate blocked on create | Functional Group `Call Handling 1` already exists | 1. Open create Functional Group panel. 2. Enter `Call Handling 1   ` with trailing spaces. 3. Save. | System trims or normalizes whitespace and blocks the create as a duplicate. | Negative | Critical |
| TC-FG-DUP-004 | Whitespace-only duplicate blocked on edit | Functional Group `Call Handling 1` exists; another Functional Group also exists | 1. Edit another Functional Group. 2. Rename it to `Call Handling 1   `. 3. Save. | System trims or normalizes whitespace and blocks the update as a duplicate. | Negative | Critical |
| TC-FG-EDT-001 | Edit option is available for existing Functional Group | At least one Functional Group exists in the list | 1. Select an existing Functional Group. 2. Check whether edit action is available. 3. Open edit panel. | User can access edit mode for an existing Functional Group. Current values are prefilled. | Functional | High |
| TC-FG-EDT-002 | Saving without changing name does not trigger duplicate error | A Functional Group exists | 1. Open edit panel for an existing Functional Group. 2. Do not change the Name. 3. Optionally change nothing else. 4. Save. | Save completes successfully. No duplicate error is shown just because the record is saving itself. | Regression | High |
| TC-FG-EDT-003 | Changing to a unique new name succeeds | A Functional Group exists and target new name is not used | 1. Open edit panel. 2. Change Name to a unique value. 3. Save. | Functional Group updates successfully and the list reflects the new name. | Functional | High |
| TC-FG-SPL-001 | Single quotes allowed in name | Valid Industry is selected; create or edit panel is open | 1. Enter a Name containing a single quote, such as `Operator's Support`. 2. Save. | Record saves successfully. No escaping or server error is thrown. Saved text preserves the single quote correctly. | Functional | Medium |
| TC-FG-SPL-002 | Single quotes allowed in description | Valid Industry is selected; create or edit panel is open | 1. Enter a valid unique Name. 2. Enter a Description containing a single quote, such as `Handles operator's workflow`. 3. Save. | Record saves successfully. Description persists correctly with the single quote intact. | Functional | Medium |

## Suggested Execution Order

1. `TC-FG-VAL-001` to `TC-FG-VAL-004`
2. `TC-FG-EDT-001`
3. `TC-FG-DUP-001` to `TC-FG-DUP-004`
4. `TC-FG-EDT-002` and `TC-FG-EDT-003`
5. `TC-FG-SPL-001` and `TC-FG-SPL-002`

## Notes for Manual Execution

- Best entry route appears to be the `Manage Industry WRCF` page.
- Functional Group create/edit is currently handled through the side panel in the first column.
- Creation depends on selecting an Industry first.
- For duplicate tests, use a controlled dataset with known existing Functional Group names.

## Current Implementation Risk Notes

Based on current repo inspection, these behaviors appear likely to need validation or fixes:

- Duplicate prevention on create
- Duplicate prevention on edit
- Whitespace-normalized duplicate handling
- Clear user-facing duplicate validation feedback

These are strong candidates for defect logging if the UI/API currently allows them.

## Next Conversion Options

This document can be converted into either:

- a manual execution report template for WRCF Functional Group testing
- Playwright UI tests for the Functional Group panel
- API-level negative and positive tests for the Functional Group endpoints
