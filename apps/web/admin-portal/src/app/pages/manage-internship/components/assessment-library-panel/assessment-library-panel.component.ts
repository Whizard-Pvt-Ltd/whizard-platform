import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { MockAssessment } from '../../models/manage-internship.models';

const MOCK_ASSESSMENTS: MockAssessment[] = [
  { id: '1', title: 'Digital Marketing Strategy Assessment', category: 'Assessment', thumbnailUrl: null },
  { id: '2', title: 'Data Analysis Fundamentals Test', category: 'Assessment', thumbnailUrl: null },
  { id: '3', title: 'Business Communication Evaluation', category: 'Assessment', thumbnailUrl: null },
  { id: '4', title: 'Cybersecurity Basics Assessment', category: 'Assessment', thumbnailUrl: null },
  { id: '5', title: 'Wireframing & Prototyping Assignment', category: 'Assessment', thumbnailUrl: null },
  { id: '6', title: 'Critical Thinking & Problem Solving', category: 'Assessment', thumbnailUrl: null },
  { id: '7', title: 'Project Management Skills', category: 'Assessment', thumbnailUrl: null },
];

@Component({
  selector: 'whizard-assessment-library-panel',
  standalone: true,
  imports: [FormsModule, MatIconModule, ScrollbarDirective],
  templateUrl: './assessment-library-panel.component.html',
})
export class AssessmentLibraryPanelComponent {
  protected readonly resourceOptions = ['Assessment'] as const;
  protected selectedResource = signal<string>('Assessment');
  protected searchQuery = signal('');

  protected filteredAssessments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return MOCK_ASSESSMENTS;
    return MOCK_ASSESSMENTS.filter(a => a.title.toLowerCase().includes(q));
  });
}
