import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { InternshipFormValue, WeeklyScheduleEntry } from '../../../../models/manage-internship.models';

@Component({
  selector: 'whizard-during-internship-tab',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatExpansionModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './during-internship-tab.component.html',
})
export class DuringInternshipTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected addWeeklyEntry(): void {
    const entry: WeeklyScheduleEntry = {
      functionalGroupId: '',
      capabilityInstanceId: '',
      coordinatorUserId: '',
      noOfWeeks: 1,
      tasks: [],
    };
    this.emit({ weeklySchedule: [...this.formValue().weeklySchedule, entry] });
  }

  protected removeWeeklyEntry(index: number): void {
    this.emit({ weeklySchedule: this.formValue().weeklySchedule.filter((_, i) => i !== index) });
  }

  protected updateEntry(index: number, patch: Partial<WeeklyScheduleEntry>): void {
    const updated = this.formValue().weeklySchedule.map((e, i) => i === index ? { ...e, ...patch } : e);
    this.emit({ weeklySchedule: updated });
  }

  protected getMidTermDate(): Date | null {
    const d = this.formValue().midTermFeedbackDate;
    return d ? new Date(d) : null;
  }

  protected onMidTermDateChange(date: Date | null): void {
    this.emit({ midTermFeedbackDate: date ? date.toISOString() : null });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
