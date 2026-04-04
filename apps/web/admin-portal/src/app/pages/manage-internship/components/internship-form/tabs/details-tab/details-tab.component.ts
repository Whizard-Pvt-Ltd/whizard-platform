import { Component, input, output, signal, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { InternshipFormValue, City } from '../../../../models/manage-internship.models';

interface RichTextField {
  key: keyof InternshipFormValue;
  label: string;
}

@Component({
  selector: 'whizard-details-tab',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './details-tab.component.html',
})
export class DetailsTabComponent implements OnInit {
  readonly formValue = input.required<InternshipFormValue>();
  readonly cities    = input<City[]>([]);
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected localBannerUrl = signal<string | null>(null);

  protected readonly richTextFields: RichTextField[] = [
    { key: 'internshipDetail',        label: 'Internship Details' },
    { key: 'roleOverview',            label: 'Role Overview' },
    { key: 'keyResponsibilities',     label: 'Key Responsibilities' },
    { key: 'eligibilityRequirements', label: 'Eligibility & Requirements' },
    { key: 'timelineWorkSchedule',    label: 'Internship Timeline & Work Schedule' },
    { key: 'perksAndBenefits',        label: 'Internship Completion Perks and Benefits' },
    { key: 'selectionProcess',        label: 'Selection Process' },
    { key: 'contactInformation',      label: 'Contact Information' },
  ];

  ngOnInit(): void {
    this.localBannerUrl.set(this.formValue().bannerImageUrl);
  }

  protected onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.localBannerUrl.set(reader.result as string);
      this.emit({ bannerImageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }

  protected updateRichTextField(key: keyof InternshipFormValue, value: string): void {
    this.emit({ [key]: value || null } as Partial<InternshipFormValue>);
  }

  protected getFieldValue(key: keyof InternshipFormValue): string {
    const val = this.formValue()[key];
    return (typeof val === 'string' ? val : null) ?? '';
  }

  protected getDeadlineDate(): Date | null {
    const d = this.formValue().applicationDeadline;
    return d ? new Date(d) : null;
  }

  protected onDeadlineChange(date: Date | null): void {
    this.emit({ applicationDeadline: date ? date.toISOString() : null });
  }
}
