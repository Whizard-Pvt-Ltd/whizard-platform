import { DatePipe } from '@angular/common';
import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import type { InternshipDetail } from '../../models/manage-internship.models';
import { STATUS_LABELS, STATUS_COLORS } from '../../models/manage-internship.models';

interface AboutSection { label: string; value: string | null; }

@Component({
  selector: 'whizard-internship-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatTabsModule, MatIconModule, MatButtonModule],
  templateUrl: './internship-detail-panel.component.html',
})
export class InternshipDetailPanelComponent {
  readonly internship = input<InternshipDetail | null>(null);
  readonly editClicked = output<void>();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusColors = STATUS_COLORS;

  protected readonly aboutSections = computed<AboutSection[]>(() => {
    const i = this.internship();
    if (!i) return [];
    return [
      { label: 'Internship Detail',          value: i.internshipDetail },
      { label: 'Role Overview',              value: i.roleOverview },
      { label: 'Key Responsibilities',       value: i.keyResponsibilities },
      { label: 'Eligibility Requirements',   value: i.eligibilityRequirements },
      { label: 'Timeline & Work Schedule',   value: i.timelineWorkSchedule },
      { label: 'Perks & Benefits',           value: i.perksAndBenefits },
      { label: 'Selection Process',          value: i.selectionProcess },
      { label: 'Contact Information',        value: i.contactInformation },
    ];
  });
}
