import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { InternshipFormValue, InternshipBatch, FileItem } from '../../../../models/manage-internship.models';
import { OFFER_RELEASE_METHOD_OPTIONS } from '../../../../models/manage-internship.models';

@Component({
  selector: 'whizard-selection-tab',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule],
  templateUrl: './selection-tab.component.html',
})
export class SelectionTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly offerReleaseMethods = OFFER_RELEASE_METHOD_OPTIONS;

  // --- Offer letter docs ---
  protected onOfferLetterSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.emit({ offerLetterTemplateUrl: file.name });
  }

  protected onTermsSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.emit({ termsConditionUrl: file.name });
  }

  // --- Batches ---
  protected addBatch(): void {
    const updated: InternshipBatch[] = [
      ...this.formValue().batches,
      { id: crypto.randomUUID(), batchSize: 25, coordinatorUserId: null },
    ];
    this.emit({ batches: updated });
  }

  protected removeBatch(index: number): void {
    this.emit({ batches: this.formValue().batches.filter((_, i) => i !== index) });
  }

  protected updateBatch(index: number, patch: Partial<InternshipBatch>): void {
    const updated = this.formValue().batches.map((b, i) => i === index ? { ...b, ...patch } : b);
    this.emit({ batches: updated });
  }

  // --- Pre-read courses/articles ---
  protected addCourse(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const updated: FileItem[] = [...this.formValue().preReadCourses, { pdfUrl: file.name, name: file.name }];
    this.emit({ preReadCourses: updated });
  }

  protected removeCourse(index: number): void {
    this.emit({ preReadCourses: this.formValue().preReadCourses.filter((_, i) => i !== index) });
  }

  protected addArticle(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const updated: FileItem[] = [...this.formValue().preReadArticles, { pdfUrl: file.name, name: file.name }];
    this.emit({ preReadArticles: updated });
  }

  protected removeArticle(index: number): void {
    this.emit({ preReadArticles: this.formValue().preReadArticles.filter((_, i) => i !== index) });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
