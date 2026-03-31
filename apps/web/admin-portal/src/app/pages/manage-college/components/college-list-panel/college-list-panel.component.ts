import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { CollegeListItem } from '../../models/manage-college.models';

const FILTER_CHIPS = [
  'Club', 'Project', 'Job', 'Internship', 'Mentor',
  'College active', 'Company', 'Event', 'Student Profile', 'All Filters',
] as const;

@Component({
  selector: 'whizard-college-list-panel',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './college-list-panel.component.html',
  styleUrl: './college-list-panel.component.css',
})
export class CollegeListPanelComponent {
  readonly colleges = input<CollegeListItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly loading = input<boolean>(false);

  readonly collegeSelected = output<string>();
  readonly addClicked = output<void>();

  protected searchQuery = signal('');
  protected activeChip = signal('College active');

  protected readonly filterChips = FILTER_CHIPS;

  protected filteredColleges = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.colleges();
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.collegeCode.toLowerCase().includes(q) ||
      (c.cityName ?? '').toLowerCase().includes(q),
    );
  });

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected selectCollege(id: string): void {
    this.collegeSelected.emit(id);
  }

  protected onAddClick(): void {
    this.addClicked.emit();
  }

  protected setActiveChip(chip: string): void {
    this.activeChip.set(chip);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
