import {
  Component, input, output, signal, OnChanges, SimpleChanges, inject, ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QuillEditorComponent, MediaUploaderComponent } from '@whizard/shared-ui';
import type { UploadedFile } from '@whizard/shared-ui';
import type {
  CollegeDetail, Club, DegreeProgram, City, UserContact, MediaAsset, CollegeFormValue,
} from '../../models/manage-college.models';
import { COLLEGE_TYPES, CONTACT_ROLES } from '../../models/manage-college.models';

@Component({
  selector: 'whizard-college-form',
  standalone: true,
  // host: { class: 'flex-1 min-h-0 flex flex-col' },
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    QuillEditorComponent,
    MediaUploaderComponent,
  ],
  templateUrl: './college-form.component.html',
  styleUrl: './college-form.component.css',
})
export class CollegeFormComponent implements OnChanges {
  readonly college = input<CollegeDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly programs = input<DegreeProgram[]>([]);
  readonly cities = input<City[]>([]);
  readonly users = input<UserContact[]>([]);
  readonly mediaAssets = input<MediaAsset[]>([]);

  readonly saved = output<CollegeFormValue>();
  readonly published = output<CollegeFormValue>();
  readonly cancelled = output<void>();
  readonly mediaUploadRequested = output<{ file: File; type: string; role: string }>();

  @ViewChild('logoUploader') private logoUploaderRef!: MediaUploaderComponent;

  private readonly fb = inject(FormBuilder);

  protected readonly collegeTypes = COLLEGE_TYPES;
  protected readonly contactRoles = CONTACT_ROLES;

  // Signals for media uploads (outside FormBuilder)
  protected logoPreview = signal<string | null>(null);
  protected logoFile = signal<File | null>(null);
  protected brochureFiles = signal<UploadedFile[]>([]);
  protected videoFiles = signal<UploadedFile[]>([]);
  protected galleryFiles = signal<UploadedFile[]>([]);

  protected form = this.fb.group({
    name: ['', Validators.required],
    affiliatedUniversity: ['', Validators.required],
    cityId: [null as string | null],
    collegeType: ['', Validators.required],
    establishedYear: [null as number | null],
    description: [null as string | null],
    degreesOffered: [null as string | null],
    placementHighlights: [null as string | null],
    inquiryEmail: [null as string | null, Validators.email],
    clubIds: [[] as string[]],
    programIds: [[] as string[]],
    contact_VICE_CHANCELLOR: [null as string | null],
    contact_PLACEMENT_HEAD: [null as string | null],
    contact_COORDINATOR: [null as string | null],
    contact_PLACEMENT_COORDINATOR: [null as string | null],
    contact_GROOM_COORDINATOR: [null as string | null],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['college']) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    const college = this.college();
    if (!college) {
      this.form.reset({
        collegeType: '',
        clubIds: [],
        programIds: [],
      });
      this.logoPreview.set(null);
      this.logoFile.set(null);
      this.brochureFiles.set([]);
      this.videoFiles.set([]);
      this.galleryFiles.set([]);
      return;
    }

    const contactMap: Record<string, string> = {};
    for (const c of college.contacts) {
      contactMap[c.role] = c.userId;
    }

    this.form.patchValue({
      name: college.name,
      affiliatedUniversity: college.affiliatedUniversity,
      cityId: college.cityId,
      collegeType: college.collegeType,
      establishedYear: college.establishedYear,
      description: college.description,
      degreesOffered: college.degreesOffered,
      placementHighlights: college.placementHighlights,
      inquiryEmail: college.inquiryEmail,
      clubIds: college.clubIds,
      programIds: college.programIds,
      contact_VICE_CHANCELLOR: contactMap['VICE_CHANCELLOR'] ?? null,
      contact_PLACEMENT_HEAD: contactMap['PLACEMENT_HEAD'] ?? null,
      contact_COORDINATOR: contactMap['COORDINATOR'] ?? null,
      contact_PLACEMENT_COORDINATOR: contactMap['PLACEMENT_COORDINATOR'] ?? null,
      contact_GROOM_COORDINATOR: contactMap['GROOM_COORDINATOR'] ?? null,
    });

    if (college.logoUrl) {
      this.logoPreview.set(college.logoUrl);
    }
  }

  get isValid(): boolean {
    return this.form.valid;
  }

  protected openLogoPicker(): void {
    this.logoUploaderRef?.openFilePicker();
  }

  protected onLogoSelected(files: UploadedFile[]): void {
    const f = files[0];
    if (f) {
      this.logoFile.set(f.file);
      this.logoPreview.set(f.preview);
      this.mediaUploadRequested.emit({ file: f.file, type: 'image', role: 'logo' });
    }
  }

  protected onBrochureSelected(files: UploadedFile[]): void {
    this.brochureFiles.update(prev => [...prev, ...files]);
    for (const f of files) {
      this.mediaUploadRequested.emit({ file: f.file, type: 'pdf', role: 'brochure' });
    }
  }

  protected removeBrochure(index: number): void {
    this.brochureFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  protected onVideoSelected(files: UploadedFile[]): void {
    this.videoFiles.update(prev => [...prev, ...files]);
    for (const f of files) {
      this.mediaUploadRequested.emit({ file: f.file, type: 'video', role: 'promotional_video' });
    }
  }

  protected removeVideo(index: number): void {
    this.videoFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  protected onGallerySelected(files: UploadedFile[]): void {
    this.galleryFiles.update(prev => [...prev, ...files]);
    for (const f of files) {
      this.mediaUploadRequested.emit({ file: f.file, type: 'image', role: 'campus_gallery' });
    }
  }

  protected removeGallery(index: number): void {
    this.galleryFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  private buildFormValue(): CollegeFormValue {
    const v = this.form.value;
    const contacts = this.contactRoles
      .map(r => ({
        userId: (v as Record<string, unknown>)[`contact_${r.value}`] as string,
        role: r.value,
      }))
      .filter(c => !!c.userId);

    const cityId = v.cityId ?? null;
    const city = this.cities().find(c => c.id === cityId);

    return {
      name: v.name ?? '',
      affiliatedUniversity: v.affiliatedUniversity ?? '',
      cityId,
      cityName: city?.name ?? null,
      collegeType: v.collegeType ?? '',
      establishedYear: v.establishedYear ?? null,
      description: v.description ?? null,
      degreesOffered: v.degreesOffered ?? null,
      placementHighlights: v.placementHighlights ?? null,
      inquiryEmail: v.inquiryEmail ?? null,
      clubIds: v.clubIds ?? [],
      programIds: v.programIds ?? [],
      contacts,
    };
  }

  doSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.buildFormValue());
  }

  doPublish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.published.emit(this.buildFormValue());
  }
}
