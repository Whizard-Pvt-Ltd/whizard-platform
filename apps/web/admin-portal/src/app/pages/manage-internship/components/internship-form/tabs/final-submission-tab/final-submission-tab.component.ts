import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { InternshipFormValue } from '../../../../models/manage-internship.models';
import { FINAL_DOCUMENT_OPTIONS } from '../../../../models/manage-internship.models';

@Component({
  selector: 'whizard-final-submission-tab',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, MatCheckboxModule,
  ],
  templateUrl: './final-submission-tab.component.html',
})
export class FinalSubmissionTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly documentOptions = FINAL_DOCUMENT_OPTIONS;

  protected isDocumentSelected(doc: string): boolean {
    return this.formValue().finalSubmissionDocuments.includes(doc);
  }

  protected toggleDocument(doc: string): void {
    const current = this.formValue().finalSubmissionDocuments;
    const updated = current.includes(doc)
      ? current.filter(d => d !== doc)
      : [...current, doc];
    this.emit({ finalSubmissionDocuments: updated });
  }

  protected onRubricSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.emit({ presentationRubricUrl: file.name });
  }

  protected onCertificateSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.emit({ certificateTemplateUrl: file.name });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
