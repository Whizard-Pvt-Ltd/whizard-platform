import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { CompanyListItem } from '../../models/manage-company.models';

@Component({
  selector: 'whizard-company-list-panel',
  standalone: true,
  imports: [MatIconModule, FormsModule, ScrollbarDirective],
  templateUrl: './company-list-panel.component.html',
  styleUrl: './company-list-panel.component.css',
})
export class CompanyListPanelComponent {
  readonly companies = input<CompanyListItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly loading = input<boolean>(true);

  readonly companySelected = output<string>();

  protected readonly mockLogoUrl = 'assets/images/Screenshot-2026-04-01-at-9.48.23-AM.png';

  protected searchQuery = signal('');

  protected filteredCompanies = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.companies();
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.companyCode.toLowerCase().includes(q) ||
      (c.cityName ?? '').toLowerCase().includes(q),
    );
  });

  protected selectCompany(id: string): void {
    this.companySelected.emit(id);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
