import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QuillEditorComponent } from '@whizard/shared-ui';
import type {
  InternshipFormValue, InternshipBatch, FileItem,
  CoordinatorUser, FunctionalGroup, City,
} from '../../../../models/manage-internship.models';
import { OFFER_RELEASE_METHOD_OPTIONS } from '../../../../models/manage-internship.models';
import { ManageInternshipApiService } from '../../../../services/manage-internship-api.service';
import { ASSESSMENT_DRAG_TYPE } from '../../../assessment-library-panel/assessment-library-panel.component';

@Component({
  selector: 'whizard-selection-tab',
  standalone: true,
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, QuillEditorComponent,
  ],
  templateUrl: './selection-tab.component.html',
})
export class SelectionTabComponent {
  private readonly api = inject(ManageInternshipApiService);

  readonly formValue = input.required<InternshipFormValue>();
  readonly cities = input<City[]>([]);
  readonly coordinators = input<CoordinatorUser[]>([]);
  readonly functionalGroups = input<FunctionalGroup[]>([]);
  readonly formChanged = output<Partial<InternshipFormValue>>();

  protected readonly offerReleaseMethods = OFFER_RELEASE_METHOD_OPTIONS;
  protected readonly uploadingOfferLetter = signal(false);
  protected readonly uploadingTerms = signal(false);

  protected readonly selectedCityName = computed(() => {
    const cityId = this.formValue().cityId;
    if (!cityId) return '';
    const city = this.cities().find(c => c.id === cityId);
    return city ? city.name : '';
  });

  // Drag-over visual state
  protected dragOverCourseIndex: number | null = null;
  protected dragOverArticleIndex: number | null = null;

  // --- Offer letter docs (S3 upload) ---
  protected onOfferLetterSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingOfferLetter.set(true);
    this.api.uploadFile(file).subscribe({
      next: (result) => {
        this.emit({ offerLetterTemplateUrl: result.key });
        this.uploadingOfferLetter.set(false);
      },
      error: () => this.uploadingOfferLetter.set(false),
    });
  }

  protected onTermsSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingTerms.set(true);
    this.api.uploadFile(file).subscribe({
      next: (result) => {
        this.emit({ termsConditionUrl: result.key });
        this.uploadingTerms.set(false);
      },
      error: () => this.uploadingTerms.set(false),
    });
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

  // --- Pre-read courses/articles drag-drop ---
  protected onDragOver(event: DragEvent, section: 'course' | 'article', index: number): void {
    if (!event.dataTransfer?.types.includes(ASSESSMENT_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (section === 'course') {
      this.dragOverCourseIndex = index;
    } else {
      this.dragOverArticleIndex = index;
    }
  }

  protected onDragLeave(section: 'course' | 'article'): void {
    if (section === 'course') {
      this.dragOverCourseIndex = null;
    } else {
      this.dragOverArticleIndex = null;
    }
  }

  protected onCourseDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverCourseIndex = null;
    const raw = event.dataTransfer?.getData(ASSESSMENT_DRAG_TYPE);
    if (!raw) return;
    const data = JSON.parse(raw) as { id: string; title: string };
    const updated: FileItem[] = [
      ...this.formValue().preReadCourses,
      { pdfUrl: data.id, name: data.title },
    ];
    this.emit({ preReadCourses: updated });
  }

  protected onArticleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverArticleIndex = null;
    const raw = event.dataTransfer?.getData(ASSESSMENT_DRAG_TYPE);
    if (!raw) return;
    const data = JSON.parse(raw) as { id: string; title: string };
    const updated: FileItem[] = [
      ...this.formValue().preReadArticles,
      { pdfUrl: data.id, name: data.title },
    ];
    this.emit({ preReadArticles: updated });
  }

  protected removeCourse(index: number): void {
    this.emit({ preReadCourses: this.formValue().preReadCourses.filter((_, i) => i !== index) });
  }

  protected removeArticle(index: number): void {
    this.emit({ preReadArticles: this.formValue().preReadArticles.filter((_, i) => i !== index) });
  }

  protected emit(patch: Partial<InternshipFormValue>): void {
    this.formChanged.emit(patch);
  }
}
