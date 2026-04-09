import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QuillEditorComponent } from '@whizard/shared-ui';
import type { InternshipFormValue } from '../../../../models/manage-internship.models';
import { FINAL_DOCUMENT_OPTIONS } from '../../../../models/manage-internship.models';

const DEFAULT_GUIDELINES = `<ul>
<li>Ensure the document is clear, readable, and properly scanned</li>
<li>Upload only final and verified documents</li>
<li>Do not upload password-protected or corrupted files</li>
<li>Avoid blurry images or cropped content</li>
<li>Each file should contain only one document</li>
</ul>`;

@Component({
  selector: 'whizard-final-submission-tab',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, QuillEditorComponent,
  ],
  templateUrl: './final-submission-tab.component.html',
})
export class FinalSubmissionTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly documentOptions = FINAL_DOCUMENT_OPTIONS;

  protected readonly guidelinesValue = computed(() =>
    this.formValue().documentGuidelines || DEFAULT_GUIDELINES,
  );

  protected onRubricSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.emit({ presentationRubricUrl: file.name });
  }

  protected onRubricDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
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
