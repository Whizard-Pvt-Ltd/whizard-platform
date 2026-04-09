import { SlicePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PdfViewerComponent, ImageLightboxComponent } from '@whizard/shared-ui';
import type { InternshipDetail, InternshipFormValue } from '../../models/manage-internship.models';
import { SignedUrlPipe } from '../../pipes/signed-url.pipe';
import { ManageInternshipApiService } from '../../services/manage-internship-api.service';

@Component({
  selector: 'whizard-internship-detail-view',
  standalone: true,
  imports: [SlicePipe, MatTabsModule, MatIconModule, SignedUrlPipe, PdfViewerComponent, ImageLightboxComponent],
  templateUrl: './internship-detail-view.component.html',
})
export class InternshipDetailViewComponent {
  private readonly api = inject(ManageInternshipApiService);

  readonly detail = input.required<InternshipDetail>();

  protected readonly activePdfUrl = signal<string | null>(null);
  protected readonly activePdfName = signal('Document');
  protected readonly activeImageUrl = signal<string | null>(null);
  protected readonly activeImageAlt = signal('');

  protected readonly aboutSections: Array<{ label: string; key: keyof InternshipFormValue }> = [
    { key: 'internshipDetail',        label: 'Internship Detail' },
    { key: 'roleOverview',            label: 'Role Overview' },
    { key: 'keyResponsibilities',     label: 'Key Responsibilities' },
    { key: 'eligibilityRequirements', label: 'Eligibility Requirements' },
    { key: 'timelineWorkSchedule',    label: 'Timeline & Work Schedule' },
    { key: 'perksAndBenefits',        label: 'Perks & Benefits' },
    { key: 'selectionProcess',        label: 'Selection Process' },
    { key: 'contactInformation',      label: 'Contact Information' },
  ];

  protected getField(key: keyof InternshipFormValue): string | null {
    const val = this.detail()[key as keyof InternshipDetail];
    return typeof val === 'string' ? val : null;
  }

  protected openPreview(key: string, name: string): void {
    this.api.getSignedUrl(key).subscribe((url) => {
      const ext = key.split('.').pop()?.toLowerCase() ?? '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
      if (isImage) {
        this.activeImageUrl.set(url);
        this.activeImageAlt.set(name);
      } else {
        this.activePdfUrl.set(url);
        this.activePdfName.set(name);
      }
    });
  }

  protected closePdf(): void { this.activePdfUrl.set(null); }
  protected closeImage(): void { this.activeImageUrl.set(null); }
}
