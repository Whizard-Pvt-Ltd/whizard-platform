Implementation Plan: Manage College Enhancement

  Analysis Summary from Screenshots + Code

- Screenshot-ui-1 (Manage Company): Reference for left-panel search placement
- Screenshot-ui-2 (Manage College): Desired layout — search inside left panel, wider left panel, detail panel with college metadata, brochure +video sections
- Screenshot-ui-3 (Quill Editor): Toolbar needs B, I, blockquote, code, H1, H2, ordered list, bullet list, subscript, superscript, indent ×2.
  Label above in #00BFFF (accent)

---

1. DB — Add cityCode to City

  prisma/schema.prisma — add cityCode String? @map("city_code") to model City

  prisma/seeds/college-operations.seed.ts — add cityCode (4 uppercase chars, e.g. BLOR, MUMR, DELH, HYDD, AHDM) to each city's seed data and upsert
   it

  Create migration: pnpm prisma:migrate:dev

---

2. Backend — College Code Generation

  Currently generates {CITYNAME}-{YEAR}-{RANDOM8}. Change to CLG-{YEAR}-{CITYCODE}-{SEQ3} (matching the CLG-2025-BLR-002 pattern in
  screenshot-ui-2).

  Files to change:

- libs/contexts/college-operations/src/domain/aggregates/college.aggregate.ts (line 82-86): Change create() to accept cityCode instead ofcityName; generate CLG-${year}-${cityCode}-${randomSequence(3)}
- libs/contexts/college-operations/src/application/commands/create-college.command.ts: Add cityCode?: string field
- libs/contexts/college-operations/src/application/command-handlers/create-college.handler.ts: Fetch city.cityCode from Prisma using cmd.cityId,
  pass it to College.create()
- apps/api/core-api/src/modules/college-operations/routes.ts: Extract cityCode from route body and pass to command (or let handler fetch it)

---

3. Backend — Fix Key Contacts showing userId instead of name

  Root cause: GetCollegeByIdQueryHandler calls toCollegeDetailDto(college, null) and the mapper at line 38 maps contacts as { userId, role } — no
  userName.

  Fix — libs/contexts/college-operations/src/application/query-handlers/get-college-by-id.handler.ts:

- After fetching college, query UserAccount for all contact userIds using getPrisma() directly
- Build a userMap: Map<string, { displayName, email }>
- Pass enriched contacts to a modified toCollegeDetailDto

  libs/contexts/college-operations/src/application/mappers/college.mapper.ts:

- Accept optional userMap param in toCollegeDetailDto, enrich each contact with userName and userEmail

  Also fix the cityName gap: same handler should fetch city.name for the college's cityId and pass it to the mapper (currently hardcoded null).

---

4. Frontend — Move Search to Left Panel

  manage-college.component.html: Remove the search `<div>` from the header (lines 22–30). Keep filter chips and Add button in header.

  manage-college.component.ts: Move searchQuery signal ownership to CollegeListPanelComponent (make it internal). Remove [searchQuery] input
  binding from the parent template.

  college-list-panel.component.html: Add a search input at the top of the left panel (below any implicit header), before the college list. Increase
   panel width from w-[260px] min-w-[260px] to w-[320px] min-w-[320px].

  college-list-panel.component.ts: Move searchQuery signal and filteredColleges computed here (they already exist here, just remove the
  [searchQuery] input).

---

5. Frontend — Edit Button Fix (mat-flat-button)

  college-detail-panel.component.html (line 22): Change mat-button → mat-flat-button. The icon heroicons_outline:pencil-square is already there —
  mat-flat-button will render it correctly.

---

6. Frontend — Add Back Button in Edit/Create Screen

  manage-college.component.html (lines 62–91): In the edit/create mode action bar, add a Back button before the other buttons:
  <button type="button" (click)="onBackClicked()" mat-stroked-button>
    `<mat-icon svgIcon="heroicons_outline:arrow-left" class="size-4" />` Back
  `</button>`

  manage-college.component.ts: Add onBackClicked() method that calls mode.set('list').

---

7. Frontend — Increase Left Panel Width in Edit Mode

  In edit/create mode the media-library panel is shown on the left. The form's left panel (search + filter) needs to be wider. Check
  media-library-panel.component.html width and adjust if needed.

  college-form.component.html: The form already uses max-w-5xl which is fine for the right content. No change needed here, width is controlled by
  parent layout.

---

8. Frontend — Fix Image/Video/Logo Upload

  Root cause — Logo: The circle `<button>` in college-form.component.html (line 29) has no click handler and whizard-media-uploader has
  class="hidden-uploader" — this CSS likely hides it. The button and uploader are disconnected.

  Fix: Add (click)="logoUploader.fileInput.click()" to the button, or expose a triggerClick() method on MediaUploaderComponent via @ViewChild.  Simplest fix: replace the hidden-uploader pattern with a ViewChild reference:

- In college-form.component.ts: add @ViewChild('logoUploaderRef') logoUploaderRef: ElementRef
- Or expose a public openFilePicker() on MediaUploaderComponent that calls fileInput.click()

  Root cause — Media not saved with college: After upload, ManageCollegeComponent.onMediaUploadRequested() adds the asset to mediaAssets signal but
   never links it to the college as a mediaItem.

  Fix:

- Modify mediaUploadRequested output type in CollegeFormComponent to include role: string — { file: File; type: string; role: string }
- Update each upload handler to pass role: logo, brochure, promotional_video, campus_gallery
- In ManageCollegeComponent: add pendingMediaItems = signal<{mediaAssetId: string; mediaRole: string; sortOrder: number}[]>([])
- On upload success in onMediaUploadRequested: append to pendingMediaItems (logo replaces existing)
- In onSaved() and onPublished(): merge existing college mediaItems with pendingMediaItems and include in update payload
- On mode change back to list: reset pendingMediaItems

  Upload UI height: Fix by ensuring brochure file row and video upload slot share consistent heights (set explicit min-h on both).

---

9. Frontend — Quill Editor Toolbar (screenshot-ui-3)

  libs/shared/ui/src/quill-editor/quill-editor.component.ts — update toolbar config (lines 100–106):

  Current:
  toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']]

  New (matching screenshot-ui-3):
  toolbar: [
    ['bold', 'italic'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
  ]

  Also update the container background to match screenshot-ui-3 (deeper dark, close to #0D1B2E):

- Change background: var(--wrcf-bg-card, #1E293B) → background: var(--wrcf-bg-primary, #0F172A)

---

10. Frontend — Quill Editor Section Labels in Accent Color

  college-form.component.html — Update section headings for Quill editor fields to use accent color label, matching screenshot-ui-3's "College
  Details" label style:

- Change `<h3 class="text-base font-semibold text-wrcf-text-primary mb-4">`College details`</h3>` → add text-wrcf-accent class

---

11. Frontend — Scrolling on Right Panel

  The detail panel already has overflow-y-auto on the scrollable content div (line 32 of college-detail-panel.component.html). If custom scrollbar
  is needed, add Tailwind scrollbar utilities or a thin CSS scrollbar override in the component styles.

---

  Files to Modify

  ┌──────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │                                             File                                             │                    Change                    │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ prisma/schema.prisma                                                                         │ Add cityCode to City                         │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ prisma/seeds/college-operations.seed.ts                                                      │ Add cityCode values                          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/contexts/college-operations/src/domain/aggregates/college.aggregate.ts                  │ New code generation                          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/contexts/college-operations/src/application/commands/create-college.command.ts          │ Add cityCode                                 │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/contexts/college-operations/src/application/command-handlers/create-college.handler.ts  │ Fetch and pass cityCode                      │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/contexts/college-operations/src/application/query-handlers/get-college-by-id.handler.ts │ Enrich contacts + cityName                   │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/contexts/college-operations/src/application/mappers/college.mapper.ts                   │ Accept userMap + cityName                    │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/shared/ui/src/media-uploader/media-uploader.component.ts                                │ Expose openFilePicker()                      │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ libs/shared/ui/src/quill-editor/quill-editor.component.ts                                    │ Update toolbar + bg                          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ manage-college.component.html                                                                │ Move search out, add Back button             │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ manage-college.component.ts                                                                  │ onBackClicked, pendingMediaItems, upload     │
  │                                                                                              │ role tracking                                │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ college-list-panel.component.html                                                            │ Add search, widen panel                      │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ college-list-panel.component.ts                                                              │ Own searchQuery signal                       │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ college-detail-panel.component.html                                                          │ mat-flat-button on Edit                      │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ college-form.component.html                                                                  │ Logo click fix, upload UI height, section    │
  │                                                                                              │ labels                                       │
  ├──────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ college-form.component.ts                                                                    │ mediaUploadRequested includes role           │
  └──────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────┘
