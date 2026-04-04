import { Component, input, output, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { CollegeListItem } from '../../models/manage-college.models';

@Component({
  selector: 'whizard-college-list-panel',
  standalone: true,
  imports: [MatIconModule, ScrollbarDirective],
  templateUrl: './college-list-panel.component.html',
  styleUrl: './college-list-panel.component.css',
})
export class CollegeListPanelComponent {
  readonly colleges = input<CollegeListItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly loading = input<boolean>(true);

  readonly collegeSelected = output<string>();

  protected searchQuery = signal('');

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

  protected selectCollege(id: string): void {
    this.collegeSelected.emit(id);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
