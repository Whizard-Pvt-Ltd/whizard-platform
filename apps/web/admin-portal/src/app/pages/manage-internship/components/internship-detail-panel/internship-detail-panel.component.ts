import { DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { InternshipDetail } from '../../models/manage-internship.models';
import { STATUS_COLORS, STATUS_LABELS } from '../../models/manage-internship.models';

interface AboutSection {
  label: string;
  value: string | null;
}

const TABS = [
  'Details',
  'Screening Criteria',
  'Selection',
  'During Internship',
  'Final Submission',
] as const;

@Component({
  selector: 'whizard-internship-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex-1 relative' },
  imports: [DatePipe, SlicePipe, UpperCasePipe, MatIconModule],
  templateUrl: './internship-detail-panel.component.html',
})
export class InternshipDetailPanelComponent {
  readonly internship = input<InternshipDetail | null>(null);
  readonly editClicked = output<void>();

  protected readonly tabs = TABS;
  protected readonly selectedTab = signal(0);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusColors = STATUS_COLORS;

  protected readonly aboutSections = computed<AboutSection[]>(() => {
    const i = this.internship();
    if (!i) return [];
    return [
      { label: 'Internship Details',        value: i.internshipDetail },
      { label: 'Role Overview',             value: i.roleOverview },
      { label: 'Key Responsibilities',      value: i.keyResponsibilities },
      { label: 'Eligibility Requirements',  value: i.eligibilityRequirements },
      { label: 'Timeline & Work Schedule',  value: i.timelineWorkSchedule },
      { label: 'Perks & Benefits',          value: i.perksAndBenefits },
      { label: 'Selection Process',         value: i.selectionProcess },
      { label: 'Contact Information',       value: i.contactInformation },
    ];
  });

  protected selectTab(index: number): void {
    this.selectedTab.set(index);
  }
}
