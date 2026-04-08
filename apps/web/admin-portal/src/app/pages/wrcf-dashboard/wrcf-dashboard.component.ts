import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import type { IndustrySector, Industry } from '../industry-wrcf/models/wrcf.models';
import type { WrcfDashboardStats } from './models/wrcf-dashboard.models';
import { WrcfApiService } from '../industry-wrcf/services/wrcf-api.service';
import { PublishDraftDialogComponent } from './components/publish-draft-dialog/publish-draft-dialog.component';
import { VersionHistoryDialogComponent } from './components/version-history-dialog/version-history-dialog.component';
import { EMPTY_STATS } from './models/wrcf-dashboard.models';
import { WrcfDashboardApiService } from './services/wrcf-dashboard-api.service';

@Component({
  selector: 'whizard-wrcf-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
],
  // host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
  templateUrl: './wrcf-dashboard.component.html',
  styleUrl: './wrcf-dashboard.component.css'
})
export class WrcfDashboardComponent implements OnInit {
  private readonly wrcfApi = inject(WrcfApiService);
  private readonly dashboardApi = inject(WrcfDashboardApiService);
  private readonly router = inject(Router);
  private readonly matDialog = inject(MatDialog);

  protected sectors = signal<IndustrySector[]>([]);
  protected industries = signal<Industry[]>([]);
  protected stats = signal<WrcfDashboardStats>(EMPTY_STATS);

  protected loading = signal(false);

  protected sectorControl = new FormControl<string | null>(null);
  protected industryControl = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.wrcfApi.listSectors().subscribe(sectors => {
      const sorted = [...sectors].sort((a, b) => a.name.localeCompare(b.name));
      this.sectors.set(sorted);
      if (sorted.length > 0) {
        this.sectorControl.setValue(sorted[0].id, { emitEvent: false });
        this.onSectorChange(sorted[0].id);
      }
    });

    this.sectorControl.valueChanges.subscribe(id => {
      if (id) this.onSectorChange(id);
    });

    this.industryControl.valueChanges.subscribe(id => {
      if (id) this.onIndustryChange(id);
    });
  }

  private onSectorChange(sectorId: string): void {
    this.industries.set([]);
    this.industryControl.setValue(null, { emitEvent: false });
    this.stats.set(EMPTY_STATS);
    this.wrcfApi.listIndustries(sectorId).subscribe(industries => {
      const sorted = [...industries].sort((a, b) => a.name.localeCompare(b.name));
      this.industries.set(sorted);
      if (sorted.length > 0) {
        this.industryControl.setValue(sorted[0].id, { emitEvent: false });
        this.onIndustryChange(sorted[0].id);
      }
    });
  }

  private onIndustryChange(industryId: string): void {
    this.stats.set(EMPTY_STATS);
    this.loading.set(true);
    this.dashboardApi.getDashboardStats(industryId).subscribe({
      next: stats => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.stats.set(EMPTY_STATS);
        this.loading.set(false);
      }
    });
  }

  protected openVersionHistory(): void {
    this.matDialog.open(VersionHistoryDialogComponent, {
      panelClass: ['dialog-panel'],
      width: '480px',
    });
  }

  protected openPublishDraft(): void {
    this.matDialog.open(PublishDraftDialogComponent, {
      panelClass: ['dialog-panel'],
      width: '480px',
    });
  }

  protected navigateToCapabilities(): void {
    this.router.navigate(['/industry-wrcf'], {
      queryParams: {
        sectorId: this.sectorControl.value,
        industryId: this.industryControl.value
      }
    });
  }

  protected navigateToRoles(): void {
    this.router.navigate(['/wrcf-roles']);
  }

  protected formatCount(n: number): string {
    return n.toLocaleString();
  }
}
