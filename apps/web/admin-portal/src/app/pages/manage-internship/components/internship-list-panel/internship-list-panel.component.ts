import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import type { InternshipListItem } from '../../models/manage-internship.models';
import { STATUS_LABELS, STATUS_COLORS } from '../../models/manage-internship.models';

@Component({
  selector: 'whizard-internship-list-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule],
  templateUrl: './internship-list-panel.component.html',
})
export class InternshipListPanelComponent {
  readonly internships = input<InternshipListItem[]>([]);
  readonly selectedId  = input<string | null>(null);
  readonly loading     = input<boolean>(false);

  readonly internshipSelected = output<string>();

  protected searchQuery = signal('');

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusColors = STATUS_COLORS;

  protected filteredInternships = computed(() => {
    const q    = this.searchQuery().toLowerCase().trim();
    const list = this.internships();
    if (!q) return list;
    return list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      (i.cityName ?? '').toLowerCase().includes(q),
    );
  });

  protected select(id: string): void {
    this.internshipSelected.emit(id);
  }

  protected formatDeadline(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  }
}
