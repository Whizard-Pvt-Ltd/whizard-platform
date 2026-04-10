import { DatePipe, DecimalPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { PdfViewerComponent, ImageLightboxComponent, SignedUrlPipe } from '@whizard/shared-ui';
import type { PdfViewerDialogData, ImageLightboxDialogData } from '@whizard/shared-ui';
import type { InternshipDetail, InternshipPlanItem, InternshipPlanScheduleItem } from '../../models/manage-internship.models';
import { STATUS_COLORS, STATUS_LABELS } from '../../models/manage-internship.models';
import { ManageInternshipApiService } from '../../services/manage-internship-api.service';

interface AboutSection {
  label: string;
  value: string | null;
}

interface WeekRow {
  weekNumber: number;
  pwoName: string;
  mentorName: string;
  capabilityInstanceName: string;
  skillNames: string;
  tasks: Array<{ taskName: string; evidence: string }>;
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
  imports: [DatePipe, DecimalPipe, SlicePipe, UpperCasePipe, MatIconModule, MatExpansionModule, SignedUrlPipe],
  templateUrl: './internship-detail-panel.component.html',
})
export class InternshipDetailPanelComponent {
  private readonly api = inject(ManageInternshipApiService);
  private readonly dialog = inject(MatDialog);

  readonly internship = input<InternshipDetail | null>(null);
  readonly editClicked = output<void>();

  protected readonly tabs = TABS;
  protected readonly selectedTab = signal(0);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusColors = STATUS_COLORS;


  // Screening section collapse state
  protected readonly screeningQuestionsCollapsed = signal(false);

  // During Internship: plans & schedule
  protected readonly plans = signal<InternshipPlanItem[]>([]);

  protected readonly weekRows = computed<WeekRow[]>(() => {
    const p = this.plans();
    if (p.length === 0) return [];
    const rows: WeekRow[] = [];
    for (const plan of p) {
      const weekMap = new Map<number, InternshipPlanScheduleItem[]>();
      for (const s of plan.schedules) {
        const arr = weekMap.get(s.weekNumber) ?? [];
        arr.push(s);
        weekMap.set(s.weekNumber, arr);
      }
      for (const [weekNumber, schedules] of weekMap) {
        const skillNames = [...new Set(schedules.map(s => s.skillName))].join(', ');
        rows.push({
          weekNumber,
          pwoName: plan.pwoName,
          mentorName: plan.mentorName,
          capabilityInstanceName: plan.capabilityInstanceName,
          skillNames,
          tasks: schedules.map(s => ({ taskName: s.taskName, evidence: s.evidence })),
        });
      }
    }
    rows.sort((a, b) => a.weekNumber - b.weekNumber);
    return rows;
  });

  constructor() {
    effect(() => {
      const i = this.internship();
      if (i) {
        this.api.getPlans(i.id).subscribe(plans => this.plans.set(plans));
      } else {
        this.plans.set([]);
      }
    });
  }

  protected readonly midTermAfterWeek = computed(() => Math.floor(this.weekRows().length / 2));

  protected readonly totalPlanWeeks = computed(() =>
    this.plans().reduce((sum, p) => sum + (p.noOfWeeks || 0), 0),
  );

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

  protected openPreview(key: string, name: string): void {
    this.api.getSignedUrl(key).subscribe((url) => {
      const ext = key.split('.').pop()?.toLowerCase() ?? '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
      if (isImage) {
        this.dialog.open<ImageLightboxComponent, ImageLightboxDialogData>(ImageLightboxComponent, {
          data: { url, alt: name },
          panelClass: 'whizard-image-dialog',
        });
      } else {
        this.dialog.open<PdfViewerComponent, PdfViewerDialogData>(PdfViewerComponent, {
          data: { url, fileName: name },
          width: '900px',
          height: '80vh',
          panelClass: 'whizard-pdf-dialog',
          backdropClass: 'whizard-dialog-backdrop',
        });
      }
    });
  }
}
