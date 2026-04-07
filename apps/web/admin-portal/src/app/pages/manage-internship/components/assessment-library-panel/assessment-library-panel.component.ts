import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ScrollbarDirective } from '@whizard/shared-ui';
import { Subscription, debounceTime } from 'rxjs';
import type { MockAssessment } from '../../models/manage-internship.models';

export const ASSESSMENT_DRAG_TYPE = 'application/whizard-assessment';

const MOCK_ASSESSMENTS: MockAssessment[] = [
  { id: '1', title: 'Digital Marketing Strategy Assessment', category: 'Assessment', thumbnailUrl: null },
  { id: '2', title: 'Data Analysis Fundamentals Test', category: 'Assessment', thumbnailUrl: null },
  { id: '3', title: 'Business Communication Evaluation', category: 'Assessment', thumbnailUrl: null },
  { id: '4', title: 'Cybersecurity Basics Assessment', category: 'Assessment', thumbnailUrl: null },
  { id: '5', title: 'Wireframing & Prototyping Assignment', category: 'Assessment', thumbnailUrl: null },
  { id: '6', title: 'Critical Thinking & Problem Solving', category: 'Assessment', thumbnailUrl: null },
  { id: '7', title: 'Project Management Skills', category: 'Assessment', thumbnailUrl: null },
];

const PLACEHOLDER_IMG = '/assets/images/assessment-placeholder.svg';

@Component({
  selector: 'whizard-assessment-library-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ScrollbarDirective,
  ],
  templateUrl: './assessment-library-panel.component.html',
})
export class AssessmentLibraryPanelComponent implements OnInit, OnDestroy {
  protected readonly resourceOptions = ['Assessment'] as const;
  protected readonly placeholderImg = PLACEHOLDER_IMG;

  protected form!: FormGroup;
  private sub = new Subscription();

  private searchQuery = signal('');
  private selectedResource = signal('Assessment');

  protected filteredAssessments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return MOCK_ASSESSMENTS;
    return MOCK_ASSESSMENTS.filter(a => a.title.toLowerCase().includes(q));
  });

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      search: [''],
      resource: ['Assessment'],
    });

    this.sub.add(
      this.form.get('search')!.valueChanges.pipe(debounceTime(200)).subscribe((v: string) => {
        this.searchQuery.set(v ?? '');
      }),
    );

    this.sub.add(
      this.form.get('resource')!.valueChanges.subscribe((v: string) => {
        this.selectedResource.set(v ?? 'Assessment');
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  protected onDragStart(event: DragEvent, item: MockAssessment): void {
    event.dataTransfer?.setData(
      ASSESSMENT_DRAG_TYPE,
      JSON.stringify({ id: item.id, title: item.title, category: item.category }),
    );
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }
}
