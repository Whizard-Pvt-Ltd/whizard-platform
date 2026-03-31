import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WrcfApiService } from '../industry-wrcf/services/wrcf-api.service';
import { WrcfDashboardApiService } from './services/wrcf-dashboard-api.service';
import { NavDrawerComponent } from '../../shared/nav-drawer/nav-drawer.component';
import { VersionHistoryDialogComponent } from './components/version-history-dialog/version-history-dialog.component';
import { PublishDraftDialogComponent } from './components/publish-draft-dialog/publish-draft-dialog.component';
import { StackAuthService } from '../../core/services/stack-auth.service';
import type { IndustrySector, Industry } from '../industry-wrcf/models/wrcf.models';
import type { WrcfDashboardStats } from './models/wrcf-dashboard.models';
import { EMPTY_STATS } from './models/wrcf-dashboard.models';

@Component({
  selector: 'whizard-wrcf-dashboard',
  standalone: true,
  imports: [FormsModule, NavDrawerComponent, VersionHistoryDialogComponent, PublishDraftDialogComponent],
  templateUrl: './wrcf-dashboard.component.html',
  styleUrl: './wrcf-dashboard.component.css'
})
export class WrcfDashboardComponent implements OnInit {
  private readonly wrcfApi = inject(WrcfApiService);
  private readonly dashboardApi = inject(WrcfDashboardApiService);
  private readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);

  protected sectors = signal<IndustrySector[]>([]);
  protected industries = signal<Industry[]>([]);
  protected selectedSectorId = signal<string | null>(null);
  protected selectedIndustry = signal<Industry | null>(null);
  protected stats = signal<WrcfDashboardStats>(EMPTY_STATS);

  protected drawerOpen = signal(false);
  protected userMenuOpen = signal(false);
  protected versionHistoryOpen = signal(false);
  protected publishDraftOpen = signal(false);
  protected loading = signal(false);

  protected get userName(): string | null {
    const user = this.stackAuthService.currentUser();
    return user?.displayName ?? user?.email?.split('@')[0] ?? null;
  }

  ngOnInit(): void {
    this.wrcfApi.listSectors().subscribe(sectors => {
      this.sectors.set(sectors);
      if (sectors.length > 0) {
        this.onSectorChange(sectors[0].id);
      }
    });
  }

  protected onSectorChange(sectorId: string): void {
    this.selectedSectorId.set(sectorId);
    this.industries.set([]);
    this.selectedIndustry.set(null);
    this.stats.set(EMPTY_STATS);
    this.wrcfApi.listIndustries(sectorId).subscribe(industries => {
      this.industries.set(industries);
      if (industries.length > 0) {
        this.onIndustryChange(industries[0].id);
      }
    });
  }

  protected onIndustryChange(industryId: string): void {
    const industry = this.industries().find(i => i.id === industryId) ?? null;
    this.selectedIndustry.set(industry);
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

  protected navigateToCapabilities(): void {
    this.router.navigate(['/industry-wrcf']);
  }

  protected navigateToRoles(): void {
    this.router.navigate(['/wrcf-roles']);
  }

  protected formatCount(n: number): string {
    return n.toLocaleString();
  }
}
