# Implementation Plan — Manage Internship - Screening Criteria Tab

**Source:** Figma node `2129-22516` (Latest Whizard Web Design System)
**Scope:** Frontend only — no DB, no API, no backend changes.

---

## 1. Design Reference Summary

| Element | Figma spec |
|---|---|
| Canvas | 1440 x 1024, bg `#0F172A` |
| Left panel | 466px wide, scrollable assessment library cards |
| Right panel | 963px wide, tab content area with internal scroll |
| Active tab | "Screening Criteria" with `#314DDF` underline indicator |
| Section titles | 20px semibold `#8AB4F8` + 17px regular `#E8F0FA` description |
| Drop zone card | 199px x 126px, `bg-whizard-bg-secondary`, rounded-lg, shadow |
| Input fields | 200px wide, `bg-whizard-bg-secondary`, rounded-[4px] |
| + button | 33x33px circle, `bg-whizard-action` |
| Check button | 96px wide, `bg-whizard-action`, rounded-lg |
| Font | Red Hat Display in Figma -> Poppins in code (WRCF v3.2) |

---

## 2. Data Model Changes

### `manage-internship.models.ts`

**AssessmentItem** — add two fields:

```typescript
export interface AssessmentItem {
  assessmentId: string;  // NEW — library item ID
  title: string;         // NEW — library item title
  pdfUrl: string;        // kept for backward compat
  minScore: number;
  weightage: number;
}
```

**InterviewRubricItem** — new interface:

```typescript
export interface InterviewRubricItem {
  assessmentId: string;
  title: string;
}
```

**InterviewRubric** — restructured:

```typescript
export interface InterviewRubric {
  items: InterviewRubricItem[];  // replaces pdfUrl
  minScore: number;
  weightage: number;
}
```

---

## 3. Frontend Changes

### 3.1 Assessment Library Panel — `assessment-library-panel.component`

#### `.ts` changes

Export a drag MIME type constant:

```typescript
export const ASSESSMENT_DRAG_TYPE = 'application/whizard-assessment';
```

Add drag start handler:

```typescript
protected onDragStart(event: DragEvent, item: MockAssessment): void {
  event.dataTransfer?.setData(
    ASSESSMENT_DRAG_TYPE,
    JSON.stringify({ id: item.id, title: item.title, category: item.category }),
  );
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
  }
}
```

#### `.html` changes

Add to each card `<div>`:

```html
draggable="true"
(dragstart)="onDragStart($event, item)"
class="... cursor-grab active:cursor-grabbing"
```

---

### 3.2 Screening Criteria Tab — `screening-criteria-tab.component`

#### Section 1: Screening Questions — no structural changes

Kept as-is: question cards with Question + Expected Answer fields, + button, remove button.

#### Section 2: Eligibility Check — layout fix

Row 1: `flex items-start justify-between max-w-3xl`
- Min. Club Points (w-50)
- Min. Internships (w-50)

Row 2: `flex items-center justify-between`
- Min. Projects (w-50, left)
- Group on right: Min. Club Certification dropdown (w-50) + Check button (gap-3)

#### Section 3: Assessment — drag-drop rewrite

Structure:
```
[Section header + title + description] [+ button]
[Drop zone 1] [Drop zone 2] [Drop zone N...]   ← flex-wrap gap-4
[Min. Assessment Score]  ←→  [Assessment Weightage]   ← justify-between max-w-3xl
```

Drop zone card (w-49.75 h-31.5):
- **Empty state**: Upload cloud icon + "Drop Assessment Here" text
- **Filled state**: Document icon + assessment title + x remove button
- **Drag-over state**: `border-2 border-whizard-accent`

TS methods:
- `addAssessmentSlot()` — pushes empty `AssessmentItem` with current global score/weightage
- `clearAssessmentSlot(index)` — removes item at index
- `getAssessmentMinScore()` / `getAssessmentWeightage()` — reads from first item or defaults to 0
- `updateAllAssessmentsScore(value)` / `updateAllAssessmentsWeightage(value)` — maps across all items
- `onDragOver(event, section, index)` — prevents default, sets dragover visual state
- `onDragLeave(section)` — clears dragover visual state
- `onAssessmentDrop(event, index)` — parses drag data, creates/replaces assessment item

#### Section 4: Interview Rubric — same pattern as Assessment

Structure:
```
[Section header + title + description] [+ button]
[Drop zone 1] [Drop zone 2] [Drop zone N...]   ← flex-wrap gap-4
[Min. Interview Score]  ←→  [Interview Weightage]   ← justify-between max-w-3xl
```

TS methods:
- `getInterviewRubric()` — returns current or default `{ items: [], minScore: 0, weightage: 0 }`
- `getRubricItems()` — returns the items array
- `addRubricSlot()` — pushes empty `InterviewRubricItem`
- `clearRubricSlot(index)` — removes item at index
- `onRubricDrop(event, index)` — parses drag data, creates/replaces rubric item
- `updateInterviewRubric(patch)` — merges patch into rubric (for score/weightage)

---

## 4. Files Modified

| File | Change |
|---|---|
| `models/manage-internship.models.ts` | Added `assessmentId`, `title` to `AssessmentItem`; added `InterviewRubricItem` interface; restructured `InterviewRubric` to use `items[]` array |
| `assessment-library-panel.component.ts` | Exported `ASSESSMENT_DRAG_TYPE` constant; added `onDragStart()` method |
| `assessment-library-panel.component.html` | Added `draggable="true"`, `(dragstart)` binding, cursor classes to cards |
| `screening-criteria-tab.component.ts` | Full rewrite: removed file upload logic; added drag-drop handlers, global score/weightage sync, rubric items management |
| `screening-criteria-tab.component.html` | Full rewrite: fixed eligibility layout; replaced file upload with drop zones; added global score/weightage fields; added interview rubric drop zones |

## 5. Files Created

None — all changes are modifications to existing files.

---

## 6. Out of Scope

- Backend API changes for persisting `assessmentId` / `InterviewRubricItem`.
- Drag-to-reorder within the drop zone list.
- Duplicate prevention (same assessment in multiple slots).
- Mobile / responsive layout — desktop only (1440px canvas).
- Other tabs content (Details, Selection, During Internship, Final Submission).
