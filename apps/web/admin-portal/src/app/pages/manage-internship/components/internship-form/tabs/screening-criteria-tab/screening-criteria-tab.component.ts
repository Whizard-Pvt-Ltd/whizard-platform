import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { InternshipFormValue, ScreeningQuestion, EligibilityCheck, AssessmentItem, InterviewRubric } from '../../../../models/manage-internship.models';

const CERT_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

@Component({
  selector: 'whizard-screening-criteria-tab',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './screening-criteria-tab.component.html',
})
export class ScreeningCriteriaTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly certLevels = CERT_LEVELS;

  // --- Screening questions (adapted from groomr ScreeningQuestionsComponent) ---
  protected addQuestion(): void {
    const updated: ScreeningQuestion[] = [
      ...this.formValue().screeningQuestions,
      { question: '', expectedAnswer: '' },
    ];
    this.emit({ screeningQuestions: updated });
  }

  protected removeQuestion(index: number): void {
    const updated = this.formValue().screeningQuestions.filter((_, i) => i !== index);
    this.emit({ screeningQuestions: updated });
  }

  protected updateQuestion(index: number, field: 'question' | 'expectedAnswer', value: string): void {
    const updated = this.formValue().screeningQuestions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q,
    );
    this.emit({ screeningQuestions: updated });
  }

  // --- Eligibility check ---
  protected updateEligibility(patch: Partial<EligibilityCheck>): void {
    const current = this.formValue().eligibilityCheck ?? {
      minClubPoints: null, minProjects: null, minInternships: null, minClubCertification: null,
    };
    this.emit({ eligibilityCheck: { ...current, ...patch } });
  }

  protected getEligibility(): EligibilityCheck {
    return this.formValue().eligibilityCheck ?? {
      minClubPoints: null, minProjects: null, minInternships: null, minClubCertification: null,
    };
  }

  // --- Assessment PDF upload ---
  protected addAssessment(): void {
    const updated: AssessmentItem[] = [
      ...this.formValue().assessments,
      { pdfUrl: '', minScore: 0, weightage: 0 },
    ];
    this.emit({ assessments: updated });
  }

  protected removeAssessment(index: number): void {
    this.emit({ assessments: this.formValue().assessments.filter((_, i) => i !== index) });
  }

  protected updateAssessment(index: number, patch: Partial<AssessmentItem>): void {
    const updated = this.formValue().assessments.map((a, i) => i === index ? { ...a, ...patch } : a);
    this.emit({ assessments: updated });
  }

  protected onAssessmentFileSelected(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Store filename as placeholder; actual upload happens on save
    this.updateAssessment(index, { pdfUrl: file.name });
  }

  // --- Interview rubric ---
  protected getInterviewRubric(): InterviewRubric {
    return this.formValue().interviewRubric ?? { pdfUrl: '', minScore: 0, weightage: 0 };
  }

  protected updateInterviewRubric(patch: Partial<InterviewRubric>): void {
    this.emit({ interviewRubric: { ...this.getInterviewRubric(), ...patch } });
  }

  protected onRubricFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.updateInterviewRubric({ pdfUrl: file.name });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
