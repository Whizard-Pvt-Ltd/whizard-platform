import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QuillEditorComponent } from '@whizard/shared-ui';
import type { InternshipFormValue } from '../../../../models/manage-internship.models';
import { FINAL_DOCUMENT_OPTIONS } from '../../../../models/manage-internship.models';
import { ManageInternshipApiService } from '../../../../services/manage-internship-api.service';
import { ASSESSMENT_DRAG_TYPE } from '../../../assessment-library-panel/assessment-library-panel.component';

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
  private readonly api = inject(ManageInternshipApiService);

  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly documentOptions = FINAL_DOCUMENT_OPTIONS;
  protected readonly uploadingCertificate = signal(false);
  protected readonly dragOverRubric = signal(false);

  protected readonly guidelinesValue = computed(() =>
    this.formValue().documentGuidelines || DEFAULT_GUIDELINES,
  );

  // Rubric drop from library (ASSESSMENT_DRAG_TYPE)
  protected onRubricDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes(ASSESSMENT_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragOverRubric.set(true);
  }

  protected onRubricDragLeave(): void {
    this.dragOverRubric.set(false);
  }

  protected onRubricDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverRubric.set(false);
    const raw = event.dataTransfer?.getData(ASSESSMENT_DRAG_TYPE);
    if (!raw) return;
    const data = JSON.parse(raw) as { id: string; title: string };
    this.emit({ presentationRubricUrl: data.title });
  }

  protected removeRubric(): void {
    this.emit({ presentationRubricUrl: null });
  }

  // Certificate upload via S3
  protected onCertificateSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingCertificate.set(true);
    this.api.uploadFile(file).subscribe({
      next: (result) => {
        this.emit({ certificateTemplateUrl: result.url });
        this.uploadingCertificate.set(false);
      },
      error: () => this.uploadingCertificate.set(false),
    });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
