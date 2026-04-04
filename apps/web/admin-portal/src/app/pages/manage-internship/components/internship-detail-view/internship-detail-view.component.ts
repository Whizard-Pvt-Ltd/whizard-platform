import { SlicePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import type { InternshipDetail, InternshipFormValue } from '../../models/manage-internship.models';

@Component({
  selector: 'whizard-internship-detail-view',
  standalone: true,
  imports: [SlicePipe, MatTabsModule],
  templateUrl: './internship-detail-view.component.html',
})
export class InternshipDetailViewComponent {
  readonly detail = input.required<InternshipDetail>();

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
}
