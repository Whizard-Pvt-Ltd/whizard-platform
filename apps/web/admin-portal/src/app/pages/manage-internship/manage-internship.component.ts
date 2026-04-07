import { Component, inject, signal, OnInit, OnDestroy, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { PageActionsService, ScrollbarDirective } from '@whizard/shared-ui';
import type {
  InternshipDetail, InternshipFormValue, PageMode, City, IndustryRole, CompanyListItem,
} from './models/manage-internship.models';
import { AuthContextService } from '../../core/services/auth-context.service';
import { AssessmentLibraryPanelComponent } from './components/assessment-library-panel/assessment-library-panel.component';
import { InternshipDetailPanelComponent } from './components/internship-detail-panel/internship-detail-panel.component';
import { InternshipFormComponent } from './components/internship-form/internship-form.component';
import { InternshipListPanelComponent } from './components/internship-list-panel/internship-list-panel.component';
import { ManageInternshipApiService } from './services/manage-internship-api.service';

const EMPTY_FORM: InternshipFormValue = {
  title: '',
  bannerImageUrl: null,
  vacancies: 1,
  cityId: null,
  stipend: null,
  durationMonths: 1,
  applicationDeadline: null,
  internshipType: 'ONSITE',
  internshipDetail: null,
  roleOverview: null,
  keyResponsibilities: null,
  eligibilityRequirements: null,
  timelineWorkSchedule: null,
  perksAndBenefits: null,
  selectionProcess: null,
  contactInformation: null,
  screeningQuestions: [],
  eligibilityCheck: null,
  assessments: [],
  interviewRubric: null,
  offerLetterTemplateUrl: null,
  termsConditionUrl: null,
  offerLetterReleaseMethod: null,
  functionalGroupId: null,
  preInternshipCommunication: null,
  preReadCourses: [],
  preReadArticles: [],
  batches: [],
  totalWeeks: null,
  weeklySchedule: [],
  midTermFeedbackDate: null,
  finalSubmissionDocuments: [],
  documentGuidelines: null,
  presentationRubricUrl: null,
  minPresentationScore: null,
  presentationWeightage: null,
  certificateTemplateUrl: null,
};

function detailToForm(detail: InternshipDetail): InternshipFormValue {
  return {
    title: detail.title,
    bannerImageUrl: detail.bannerImageUrl,
    vacancies: detail.vacancies,
    cityId: detail.cityId,
    stipend: detail.stipend,
    durationMonths: detail.durationMonths,
    applicationDeadline: detail.applicationDeadline,
    internshipType: detail.internshipType,
    internshipDetail: detail.internshipDetail,
    roleOverview: detail.roleOverview,
    keyResponsibilities: detail.keyResponsibilities,
    eligibilityRequirements: detail.eligibilityRequirements,
    timelineWorkSchedule: detail.timelineWorkSchedule,
    perksAndBenefits: detail.perksAndBenefits,
    selectionProcess: detail.selectionProcess,
    contactInformation: detail.contactInformation,
    screeningQuestions: detail.screeningQuestions,
    eligibilityCheck: detail.eligibilityCheck,
    assessments: detail.assessments,
    interviewRubric: detail.interviewRubric,
    offerLetterTemplateUrl: detail.offerLetterTemplateUrl,
    termsConditionUrl: detail.termsConditionUrl,
    offerLetterReleaseMethod: detail.offerLetterReleaseMethod,
    functionalGroupId: detail.functionalGroupId,
    preInternshipCommunication: detail.preInternshipCommunication,
    preReadCourses: detail.preReadCourses,
    preReadArticles: detail.preReadArticles,
    batches: detail.batches,
    totalWeeks: detail.totalWeeks,
    weeklySchedule: detail.weeklySchedule,
    midTermFeedbackDate: detail.midTermFeedbackDate,
    finalSubmissionDocuments: detail.finalSubmissionDocuments,
    documentGuidelines: detail.documentGuidelines,
    presentationRubricUrl: detail.presentationRubricUrl,
    minPresentationScore: detail.minPresentationScore,
    presentationWeightage: detail.presentationWeightage,
    certificateTemplateUrl: detail.certificateTemplateUrl,
  };
}

@Component({
  selector: 'whizard-manage-internship',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    InternshipListPanelComponent,
    InternshipDetailPanelComponent,
    AssessmentLibraryPanelComponent,
    InternshipFormComponent,
    ScrollbarDirective,
  ],
  templateUrl: './manage-internship.component.html',
})
export class ManageInternshipComponent implements OnInit, OnDestroy {
  private readonly api = inject(ManageInternshipApiService);
  private readonly pageActions = inject(PageActionsService);
  protected readonly authCtx = inject(AuthContextService);

  protected mode = signal<PageMode>('list');
  protected loading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected internships = signal<InternshipDetail[]>([]);
  protected selectedInternship = signal<InternshipDetail | null>(null);
  protected formValue = signal<InternshipFormValue>({ ...EMPTY_FORM });
  protected saving = signal(false);
  protected cities = signal<City[]>([]);
  protected industryRoles = signal<IndustryRole[]>([]);
  protected companies = signal<CompanyListItem[]>([]);

  protected readonly isAdminOrSystemUser = computed(() =>
    this.authCtx.tenantType() === 'ADMIN' || this.authCtx.tenantType() === 'SYSTEM'
  );

  protected readonly selectedId = computed(
    () => this.selectedInternship()?.id ?? null,
  );

  constructor() {
    effect(() => {
      const m = this.mode();
      const isSaving = this.saving();
      if (m === 'list') {
        this.pageActions.set([
          {
            label: 'Add',
            icon: 'heroicons_outline:plus',
            variant: 'primary',
            action: () => this.onAddClicked(),
          },
        ]);
      } else {
        this.pageActions.set([
          {
            label: 'Cancel',
            variant: 'outline',
            disabled: isSaving,
            action: () => this.onCancelClicked(),
          },
          {
            label: 'Save',
            variant: 'outline',
            disabled: isSaving,
            action: () => this.onSaveClicked(),
          },
          {
            label: 'Publish',
            variant: 'primary',
            disabled: isSaving,
            action: () => this.onPublishClicked(),
          },
        ]);
      }
    });
  }

  ngOnDestroy(): void {
    this.pageActions.clear();
  }

  ngOnInit(): void {
    if (!this.authCtx.isLoaded()) {
      this.authCtx.load().subscribe(() => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    this.loadList();
    this.api.listCities().subscribe(c => this.cities.set(c));
    this.api.listIndustryRoles().subscribe(r => this.industryRoles.set(r));
    if (this.isAdminOrSystemUser()) {
      this.api.listCompaniesForSelector().subscribe(c => this.companies.set(c));
    }
  }

  private loadList(): void {
    this.loading.set(true);
    this.api.listInternships().subscribe({
      next: (list) => {
        this.internships.set(list);
        this.loading.set(false);
        if (list.length > 0) {
          this.selectInternship(list[0]);
        }
      },
      error: () => {
        this.loading.set(false);
        this.showError('Failed to load internships.');
      },
    });
  }

  private selectInternship(detail: InternshipDetail): void {
    this.selectedInternship.set(detail);
    this.formValue.set(detailToForm(detail));
  }

  protected onInternshipSelected(id: string): void {
    const detail = this.internships().find(i => i.id === id);
    if (detail) this.selectInternship(detail);
  }

  protected onCompanySelected(tenantId: string): void {
    this.authCtx.selectedCompanyTenantId.set(tenantId || null);
    this.loadList();
  }

  protected onAddClicked(): void {
    this.selectedInternship.set(null);
    this.formValue.set({ ...EMPTY_FORM });
    this.mode.set('create');
  }

  protected onEditClicked(): void {
    const detail = this.selectedInternship();
    if (detail) {
      this.formValue.set(detailToForm(detail));
      this.mode.set('edit');
    }
  }

  protected onFormChanged(patch: Partial<InternshipFormValue>): void {
    this.formValue.update((v) => ({ ...v, ...patch }));
  }

  protected onSaveClicked(): void {
    this.saving.set(true);
    const existing = this.selectedInternship();
    const form = this.formValue();

    if (existing) {
      this.api.updateInternship(existing.id, form).subscribe({
        next: (updated) => {
          this.selectedInternship.set(updated);
          this.internships.update((list) =>
            list.map((i) => (i.id === updated.id ? updated : i)),
          );
          this.saving.set(false);
          this.mode.set('list');
        },
        error: () => {
          this.saving.set(false);
          this.showError('Failed to save internship.');
        },
      });
    } else {
      this.api.createInternship(form).subscribe({
        next: (created) => {
          this.selectedInternship.set(created);
          this.internships.update((list) => [created, ...list]);
          this.saving.set(false);
          this.mode.set('list');
        },
        error: () => {
          this.saving.set(false);
          this.showError('Failed to create internship.');
        },
      });
    }
  }

  protected onPublishClicked(): void {
    this.saving.set(true);
    const existing = this.selectedInternship();
    const form = this.formValue();

    const doPublish = (id: string) => {
      this.api.publishInternship(id).subscribe({
        next: (published) => {
          this.selectedInternship.set(published);
          this.internships.update((list) =>
            list.map((i) => (i.id === published.id ? published : i)),
          );
          this.saving.set(false);
          this.mode.set('list');
        },
        error: () => {
          this.saving.set(false);
          this.showError('Failed to publish internship.');
        },
      });
    };

    if (existing) {
      this.api.updateInternship(existing.id, form).subscribe({
        next: (updated) => doPublish(updated.id),
        error: () => {
          this.saving.set(false);
          this.showError('Failed to save before publishing.');
        },
      });
    } else {
      this.api.createInternship(form).subscribe({
        next: (created) => {
          this.internships.update((list) => [created, ...list]);
          doPublish(created.id);
        },
        error: () => {
          this.saving.set(false);
          this.showError('Failed to create before publishing.');
        },
      });
    }
  }

  protected onCancelClicked(): void {
    this.mode.set('list');
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
