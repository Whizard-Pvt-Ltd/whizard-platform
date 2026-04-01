import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { CompanyListItem } from '../../models/manage-company.models';

@Component({
  selector: 'whizard-company-list-panel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './company-list-panel.component.html',
  styleUrl: './company-list-panel.component.css',
})
export class CompanyListPanelComponent {
  readonly companies = input<CompanyListItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly loading = input<boolean>(false);

  readonly companySelected = output<string>();

  protected selectCompany(id: string): void {
    this.companySelected.emit(id);
  }

  protected getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
