import {
  Component, input, output, signal, OnChanges, SimpleChanges, inject,
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
  CompanyDetail, Club, Industry, City, UserContact, MediaAsset, CompanyFormValue,
} from '../../models/manage-company.models';
import { COMPANY_TYPES, COMPANY_CONTACT_ROLES } from '../../models/manage-company.models';

type FormTab = 'details' | 'media';

interface MediaEntry {
  mediaAssetId: string;
  mediaRole: string;
  sortOrder: number;
  previewUrl: string | null;
  name: string;
  isVideo: boolean;
}

@Component({
  selector: 'whizard-company-form',
  standalone: true,
  host: { class: 'flex-1 min-h-0 flex flex-col' },
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
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.css',
})
export class CompanyFormComponent implements OnChanges {
  readonly company = input<CompanyDetail | null>(null);
  readonly clubs = input<Club[]>([]);
  readonly industries = input<Industry[]>([]);
  readonly cities = input<City[]>([]);
  readonly users = input<UserContact[]>([]);
  readonly mediaAssets = input<MediaAsset[]>([]);

  readonly saved = output<CompanyFormValue>();
  readonly published = output<CompanyFormValue>();
  readonly cancelled = output<void>();
  readonly previewClicked = output<void>();
  readonly mediaUploadRequested = output<File>();

  private readonly fb = inject(FormBuilder);

  protected readonly companyTypes = COMPANY_TYPES;
  protected readonly contactRoles = COMPANY_CONTACT_ROLES;
  protected activeTab = signal<FormTab>('details');

  protected logoPreview = signal<string | null>(null);
  protected logoAssetId = signal<string | null>(null);

  protected brochureItems = signal<MediaEntry[]>([]);
  protected promoVideoItems = signal<MediaEntry[]>([]);
  protected galleryItems = signal<MediaEntry[]>([]);
  protected testimonialItems = signal<MediaEntry[]>([]);

  protected form = this.fb.group({
    name: ['', Validators.required],
    industryId: [null as string | null],
    cityId: [null as string | null],
    companyType: [null as string | null],
    establishedYear: [null as number | null],
    description: [null as string | null],
    whatWeOffer: [null as string | null],
    awardsRecognition: [null as string | null],
    keyProductsServices: [null as string | null],
    recruitmentHighlights: [null as string | null],
    placementStats: [null as string | null],
    inquiryEmail: [null as string | null, Validators.email],
    parentClubId: [null as string | null],
    associatedClubId: [null as string | null],
    contact_HR_COORDINATOR: [[] as string[]],
    contact_COMMUNICATION_COORDINATOR: [null as string | null],
    contact_RECRUITMENT_HEAD: [null as string | null],
    contact_TRAINING_COORDINATOR: [null as string | null],
    contact_INTERNSHIP_MENTOR: [null as string | null],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['company']) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    const company = this.company();
    if (!company) {
      this.form.reset({ contact_HR_COORDINATOR: [] });
      this.logoPreview.set(null);
      this.logoAssetId.set(null);
      this.brochureItems.set([]);
      this.promoVideoItems.set([]);
      this.galleryItems.set([]);
      this.testimonialItems.set([]);
      return;
    }

    const parentClub = company.clubs.find(c => c.isParent);
    const assocClub = company.clubs.find(c => !c.isParent);

    const hrUserIds = company.contacts.filter(c => c.role === 'HR_COORDINATOR').map(c => c.userId);
    const getContact = (role: string) => company.contacts.find(c => c.role === role)?.userId ?? null;

    this.form.patchValue({
      name: company.name,
      industryId: company.industryId,
      cityId: company.cityId,
      companyType: company.companyType,
      establishedYear: company.establishedYear,
      description: company.description,
      whatWeOffer: company.whatWeOffer,
      awardsRecognition: company.awardsRecognition,
      keyProductsServices: company.keyProductsServices,
      recruitmentHighlights: company.recruitmentHighlights,
      placementStats: company.placementStats,
      inquiryEmail: company.inquiryEmail,
      parentClubId: parentClub?.clubId ?? null,
      associatedClubId: assocClub?.clubId ?? null,
      contact_HR_COORDINATOR: hrUserIds,
      contact_COMMUNICATION_COORDINATOR: getContact('COMMUNICATION_COORDINATOR'),
      contact_RECRUITMENT_HEAD: getContact('RECRUITMENT_HEAD'),
      contact_TRAINING_COORDINATOR: getContact('TRAINING_COORDINATOR'),
      contact_INTERNSHIP_MENTOR: getContact('INTERNSHIP_MENTOR'),
    });

    const logoItem = company.mediaItems.find(m => m.mediaRole === 'logo');
    if (logoItem?.asset) {
      this.logoPreview.set(logoItem.asset.url);
      this.logoAssetId.set(logoItem.mediaAssetId);
    }

    this.brochureItems.set(this.toEntries(company.mediaItems.filter(m => m.mediaRole === 'brochure')));
    this.promoVideoItems.set(this.toEntries(company.mediaItems.filter(m => m.mediaRole === 'promotional_video')));
    this.galleryItems.set(this.toEntries(company.mediaItems.filter(m => m.mediaRole === 'gallery')));
    this.testimonialItems.set(this.toEntries(company.mediaItems.filter(m => m.mediaRole === 'testimonial')));
  }

  private toEntries(items: { mediaAssetId: string; mediaRole: string; sortOrder: number; asset: { url: string; name: string; mimeType: string; thumbnailUrl: string | null } | null }[]): MediaEntry[] {
    return items.map(m => ({
      mediaAssetId: m.mediaAssetId,
      mediaRole: m.mediaRole,
      sortOrder: m.sortOrder,
      previewUrl: m.asset?.thumbnailUrl ?? m.asset?.url ?? null,
      name: m.asset?.name ?? '',
      isVideo: m.asset?.mimeType.startsWith('video/') ?? false,
    }));
  }

  protected get isValid(): boolean {
    return this.form.valid;
  }

  protected onLogoSelected(files: UploadedFile[]): void {
    const f = files[0];
    if (!f) return;
    this.logoPreview.set(f.preview);
    this.mediaUploadRequested.emit(f.file);
  }

  protected onLogoAssetSelected(assetId: string, url: string): void {
    this.logoAssetId.set(assetId);
    this.logoPreview.set(url);
  }

  protected onBrochureSelected(files: UploadedFile[]): void {
    for (const f of files) {
      const entry: MediaEntry = {
        mediaAssetId: '',
        mediaRole: 'brochure',
        sortOrder: this.brochureItems().length,
        previewUrl: f.preview,
        name: f.file.name,
        isVideo: false,
      };
      this.brochureItems.update(prev => [...prev, entry]);
      this.mediaUploadRequested.emit(f.file);
    }
  }

  protected removeBrochure(index: number): void {
    this.brochureItems.update(prev => prev.filter((_, i) => i !== index));
  }

  protected onPromoVideoSelected(files: UploadedFile[]): void {
    for (const f of files) {
      const entry: MediaEntry = {
        mediaAssetId: '',
        mediaRole: 'promotional_video',
        sortOrder: this.promoVideoItems().length,
        previewUrl: f.preview,
        name: f.file.name,
        isVideo: true,
      };
      this.promoVideoItems.update(prev => [...prev, entry]);
      this.mediaUploadRequested.emit(f.file);
    }
  }

  protected removePromoVideo(index: number): void {
    this.promoVideoItems.update(prev => prev.filter((_, i) => i !== index));
  }

  protected onGallerySelected(files: UploadedFile[]): void {
    for (const f of files) {
      const entry: MediaEntry = {
        mediaAssetId: '',
        mediaRole: 'gallery',
        sortOrder: this.galleryItems().length,
        previewUrl: f.preview,
        name: f.file.name,
        isVideo: false,
      };
      this.galleryItems.update(prev => [...prev, entry]);
      this.mediaUploadRequested.emit(f.file);
    }
  }

  protected removeGallery(index: number): void {
    this.galleryItems.update(prev => prev.filter((_, i) => i !== index));
  }

  protected onTestimonialSelected(files: UploadedFile[]): void {
    for (const f of files) {
      const entry: MediaEntry = {
        mediaAssetId: '',
        mediaRole: 'testimonial',
        sortOrder: this.testimonialItems().length,
        previewUrl: f.preview,
        name: f.file.name,
        isVideo: true,
      };
      this.testimonialItems.update(prev => [...prev, entry]);
      this.mediaUploadRequested.emit(f.file);
    }
  }

  protected removeTestimonial(index: number): void {
    this.testimonialItems.update(prev => prev.filter((_, i) => i !== index));
  }

  private buildMediaItems(): { mediaAssetId: string; mediaRole: string; sortOrder: number }[] {
    const all: { mediaAssetId: string; mediaRole: string; sortOrder: number }[] = [];
    if (this.logoAssetId()) {
      all.push({ mediaAssetId: this.logoAssetId()!, mediaRole: 'logo', sortOrder: 0 });
    }
    let order = 0;
    for (const item of [...this.brochureItems(), ...this.promoVideoItems(), ...this.galleryItems(), ...this.testimonialItems()]) {
      if (item.mediaAssetId) {
        all.push({ mediaAssetId: item.mediaAssetId, mediaRole: item.mediaRole, sortOrder: order++ });
      }
    }
    return all;
  }

  private buildFormValue(): CompanyFormValue {
    const v = this.form.value;
    const contacts: { userId: string; role: string }[] = [];

    const hrIds = (v.contact_HR_COORDINATOR as string[] | null) ?? [];
    for (const userId of hrIds) {
      contacts.push({ userId, role: 'HR_COORDINATOR' });
    }
    if (v.contact_COMMUNICATION_COORDINATOR) contacts.push({ userId: v.contact_COMMUNICATION_COORDINATOR, role: 'COMMUNICATION_COORDINATOR' });
    if (v.contact_RECRUITMENT_HEAD) contacts.push({ userId: v.contact_RECRUITMENT_HEAD, role: 'RECRUITMENT_HEAD' });
    if (v.contact_TRAINING_COORDINATOR) contacts.push({ userId: v.contact_TRAINING_COORDINATOR, role: 'TRAINING_COORDINATOR' });
    if (v.contact_INTERNSHIP_MENTOR) contacts.push({ userId: v.contact_INTERNSHIP_MENTOR, role: 'INTERNSHIP_MENTOR' });

    return {
      name: v.name ?? '',
      industryId: v.industryId ?? null,
      cityId: v.cityId ?? null,
      companyType: v.companyType ?? null,
      establishedYear: v.establishedYear ?? null,
      description: v.description ?? null,
      whatWeOffer: v.whatWeOffer ?? null,
      awardsRecognition: v.awardsRecognition ?? null,
      keyProductsServices: v.keyProductsServices ?? null,
      recruitmentHighlights: v.recruitmentHighlights ?? null,
      placementStats: v.placementStats ?? null,
      inquiryEmail: v.inquiryEmail ?? null,
      parentClubId: v.parentClubId ?? null,
      associatedClubId: v.associatedClubId ?? null,
      contacts,
      mediaItems: this.buildMediaItems(),
    };
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.buildFormValue());
  }

  protected onPublish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.published.emit(this.buildFormValue());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
