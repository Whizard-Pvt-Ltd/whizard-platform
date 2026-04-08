import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type {
  InternshipFormValue, ScreeningQuestion, EligibilityCheck,
  AssessmentItem, InterviewRubric, InterviewRubricItem,
} from '../../../../models/manage-internship.models';
import { ASSESSMENT_DRAG_TYPE } from '../../../assessment-library-panel/assessment-library-panel.component';

const CERT_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

@Component({
  selector: 'whizard-screening-criteria-tab',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './screening-criteria-tab.component.html',
})
export class ScreeningCriteriaTabComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly certLevels = CERT_LEVELS;

  // Drag-over visual state
  protected dragOverAssessmentIndex: number | null = null;
  protected dragOverRubricIndex: number | null = null;

  // ── Screening Questions ──────────────────────────────────────────────

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

  // ── Eligibility Check ────────────────────────────────────────────────

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

  // ── Assessment (drag-drop + global score/weightage) ──────────────────

  protected addAssessmentSlot(): void {
    const updated: AssessmentItem[] = [
      ...this.formValue().assessments,
      { assessmentId: '', title: '', pdfUrl: '', minScore: this.getAssessmentMinScore(), weightage: this.getAssessmentWeightage() },
    ];
    this.emit({ assessments: updated });
  }

  protected clearAssessmentSlot(index: number): void {
    this.emit({ assessments: this.formValue().assessments.filter((_, i) => i !== index) });
  }

  protected getAssessmentMinScore(): number {
    return this.formValue().assessments[0]?.minScore ?? 0;
  }

  protected getAssessmentWeightage(): number {
    return this.formValue().assessments[0]?.weightage ?? 0;
  }

  protected updateAllAssessmentsScore(score: number): void {
    const updated = this.formValue().assessments.map(a => ({ ...a, minScore: score }));
    this.emit({ assessments: updated });
  }

  protected updateAllAssessmentsWeightage(weightage: number): void {
    const updated = this.formValue().assessments.map(a => ({ ...a, weightage }));
    this.emit({ assessments: updated });
  }

  // ── Interview Rubric (drag-drop + global score/weightage) ────────────

  protected getInterviewRubric(): InterviewRubric {
    return this.formValue().interviewRubric ?? { items: [], minScore: 0, weightage: 0 };
  }

  protected getRubricItems(): InterviewRubricItem[] {
    return this.getInterviewRubric().items;
  }

  protected addRubricSlot(): void {
    const current = this.getInterviewRubric();
    const updated: InterviewRubric = {
      ...current,
      items: [...current.items, { assessmentId: '', title: '' }],
    };
    this.emit({ interviewRubric: updated });
  }

  protected clearRubricSlot(index: number): void {
    const current = this.getInterviewRubric();
    this.emit({
      interviewRubric: {
        ...current,
        items: current.items.filter((_, i) => i !== index),
      },
    });
  }

  protected updateInterviewRubric(patch: Partial<InterviewRubric>): void {
    this.emit({ interviewRubric: { ...this.getInterviewRubric(), ...patch } });
  }

  // ── Drag & Drop handlers ─────────────────────────────────────────────

  protected onDragOver(event: DragEvent, section: 'assessment' | 'rubric', index: number): void {
    if (!event.dataTransfer?.types.includes(ASSESSMENT_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (section === 'assessment') {
      this.dragOverAssessmentIndex = index;
    } else {
      this.dragOverRubricIndex = index;
    }
  }

  protected onDragLeave(section: 'assessment' | 'rubric'): void {
    if (section === 'assessment') {
      this.dragOverAssessmentIndex = null;
    } else {
      this.dragOverRubricIndex = null;
    }
  }

  protected onAssessmentDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverAssessmentIndex = null;

    const raw = event.dataTransfer?.getData(ASSESSMENT_DRAG_TYPE);
    if (!raw) return;

    const data = JSON.parse(raw) as { id: string; title: string };
    const score = this.getAssessmentMinScore();
    const weightage = this.getAssessmentWeightage();
    const newItem: AssessmentItem = {
      assessmentId: data.id, title: data.title, pdfUrl: '', minScore: score, weightage,
    };

    if (index === -1) {
      // Dropped on empty-state zone — create new entry
      this.emit({ assessments: [newItem] });
    } else {
      // Replace existing slot
      const updated = this.formValue().assessments.map((a, i) => i === index ? newItem : a);
      this.emit({ assessments: updated });
    }
  }

  protected onRubricDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverRubricIndex = null;

    const raw = event.dataTransfer?.getData(ASSESSMENT_DRAG_TYPE);
    if (!raw) return;

    const data = JSON.parse(raw) as { id: string; title: string };
    const newItem: InterviewRubricItem = { assessmentId: data.id, title: data.title };
    const current = this.getInterviewRubric();

    if (index === -1) {
      this.emit({ interviewRubric: { ...current, items: [newItem] } });
    } else {
      const updatedItems = current.items.map((r, i) => i === index ? newItem : r);
      this.emit({ interviewRubric: { ...current, items: updatedItems } });
    }
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
