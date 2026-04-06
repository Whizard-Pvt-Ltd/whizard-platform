import { Component, OnDestroy, OnInit, effect, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { QuillEditorComponent } from '@whizard/shared-ui';
import { Subscription, debounceTime } from 'rxjs';
import type { City, IndustryRole, InternshipFormValue } from '../../../../models/manage-internship.models';

interface RichTextField {
  key: keyof InternshipFormValue;
  label: string;
  required?: boolean;
}

@Component({
  selector: 'whizard-details-tab',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule,
    QuillEditorComponent,
  ],
  templateUrl: './details-tab.component.html',
})
export class DetailsTabComponent implements OnInit, OnDestroy {
  readonly formValue     = input.required<InternshipFormValue>();
  readonly cities        = input<City[]>([]);
  readonly industryRoles = input<IndustryRole[]>([]);
  readonly formChanged   = output<Partial<InternshipFormValue>>();

  private  readonly fb   = inject(FormBuilder);
  private  sub           = new Subscription();

  protected localBannerUrl = signal<string | null>(null);
  protected readonly tomorrowDate = new Date(Date.now() + 86_400_000);

  protected readonly richTextFields: RichTextField[] = [
    { key: 'internshipDetail',        label: 'Internship Details',                       required: true },
    { key: 'roleOverview',            label: 'Role Overview',                            required: true },
    { key: 'keyResponsibilities',     label: 'Key Responsibilities',                     required: true },
    { key: 'eligibilityRequirements', label: 'Eligibility & Requirements'                              },
    { key: 'timelineWorkSchedule',    label: 'Internship Timeline & Work Schedule'                     },
    { key: 'perksAndBenefits',        label: 'Internship Completion Perks and Benefits'               },
    { key: 'selectionProcess',        label: 'Selection Process'                                       },
    { key: 'contactInformation',      label: 'Contact Information'                                    },
  ];

  // Typed form group — internshipType stored as boolean (true = REMOTE) for the slide-toggle
  protected form!: FormGroup<ReturnType<DetailsTabComponent['buildForm']>>;

  constructor() {
    // Re-sync from parent signal whenever it changes (e.g. after external save or tab switch).
    // emitEvent:false prevents triggering valueChanges → infinite loop.
    effect(() => {
      const fv = this.formValue();
      this.form?.patchValue(this.toModel(fv), { emitEvent: false });
    });
  }

  ngOnInit(): void {
    const fv = this.formValue();
    this.localBannerUrl.set(fv.bannerImageUrl);

    this.form = this.fb.group(this.buildForm(fv));

    // Auto-select first industry role when creating a new internship
    if (!fv.title && this.industryRoles().length > 0) {
      this.form.patchValue({ title: this.industryRoles()[0].name }, { emitEvent: false });
    }

    // Emit patches to parent on any field change (debounce=0 lets current tick settle first)
    this.sub.add(
      this.form.valueChanges.pipe(debounceTime(0)).subscribe(val => {
        this.formChanged.emit(this.fromModel(val));
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ── Banner (outside the FormGroup — handled via FileReader) ───────────────

  protected onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.localBannerUrl.set(reader.result as string);
      this.formChanged.emit({ bannerImageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  protected removeBanner(event: Event): void {
    event.stopPropagation();
    this.localBannerUrl.set(null);
    this.formChanged.emit({ bannerImageUrl: null });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildForm(fv: InternshipFormValue) {
    return {
      title:                  this.fb.control(fv.title,                                      Validators.required),
      vacancies:              this.fb.control(fv.vacancies,                                   [Validators.required, Validators.min(1)]),
      cityId:                 this.fb.control(fv.cityId),
      stipend:                this.fb.control(fv.stipend),
      durationMonths:         this.fb.control(fv.durationMonths,                             [Validators.required, Validators.min(1), Validators.max(24)]),
      applicationDeadline:    this.fb.control<Date | null>(
                                fv.applicationDeadline ? new Date(fv.applicationDeadline) : null,
                              ),
      internshipType:         this.fb.control(fv.internshipType === 'REMOTE'),  // boolean for slide-toggle
      internshipDetail:       this.fb.control(fv.internshipDetail,                           Validators.required),
      roleOverview:           this.fb.control(fv.roleOverview,                              Validators.required),
      keyResponsibilities:    this.fb.control(fv.keyResponsibilities,                        Validators.required),
      eligibilityRequirements:this.fb.control(fv.eligibilityRequirements),
      timelineWorkSchedule:   this.fb.control(fv.timelineWorkSchedule),
      perksAndBenefits:       this.fb.control(fv.perksAndBenefits),
      selectionProcess:       this.fb.control(fv.selectionProcess),
      contactInformation:     this.fb.control(fv.contactInformation),
    };
  }

  /** InternshipFormValue  →  form model */
  private toModel(fv: InternshipFormValue) {
    return {
      title:                   fv.title,
      vacancies:               fv.vacancies,
      cityId:                  fv.cityId,
      stipend:                 fv.stipend,
      durationMonths:          fv.durationMonths,
      applicationDeadline:     fv.applicationDeadline ? new Date(fv.applicationDeadline) : null,
      internshipType:          fv.internshipType === 'REMOTE',
      internshipDetail:        fv.internshipDetail,
      roleOverview:            fv.roleOverview,
      keyResponsibilities:     fv.keyResponsibilities,
      eligibilityRequirements: fv.eligibilityRequirements,
      timelineWorkSchedule:    fv.timelineWorkSchedule,
      perksAndBenefits:        fv.perksAndBenefits,
      selectionProcess:        fv.selectionProcess,
      contactInformation:      fv.contactInformation,
    };
  }

  /** Form model  →  InternshipFormValue patch */
  private fromModel(val: Partial<ReturnType<typeof this.form.getRawValue>>): Partial<InternshipFormValue> {
    return {
      title:                   val.title ?? '',
      vacancies:               val.vacancies != null ? +val.vacancies : 1,
      cityId:                  val.cityId ?? null,
      stipend:                 val.stipend != null ? +val.stipend : 2000,
      durationMonths:          val.durationMonths != null ? +val.durationMonths : 1,
      applicationDeadline:     val.applicationDeadline instanceof Date
                                 ? val.applicationDeadline.toISOString()
                                 : null,
      internshipType:          val.internshipType ? 'REMOTE' : 'ONSITE',
      internshipDetail:        val.internshipDetail || null,
      roleOverview:            val.roleOverview || null,
      keyResponsibilities:     val.keyResponsibilities || null,
      eligibilityRequirements: val.eligibilityRequirements || null,
      timelineWorkSchedule:    val.timelineWorkSchedule || null,
      perksAndBenefits:        val.perksAndBenefits || null,
      selectionProcess:        val.selectionProcess || null,
      contactInformation:      val.contactInformation || null,
    };
  }
}
