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
import { StackAuthService } from '../../core/services/stack-auth.service';
import { NavDrawerComponent } from '../../shared/nav-drawer/nav-drawer.component';
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
    NavDrawerComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './wrcf-dashboard.component.html',
  styleUrl: './wrcf-dashboard.component.css'
})
export class WrcfDashboardComponent implements OnInit {
  private readonly wrcfApi = inject(WrcfApiService);
  private readonly dashboardApi = inject(WrcfDashboardApiService);
  private readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);
  private readonly matDialog = inject(MatDialog);

  protected sectors = signal<IndustrySector[]>([]);
  protected industries = signal<Industry[]>([]);
  protected stats = signal<WrcfDashboardStats>(EMPTY_STATS);

  protected drawerOpen = signal(false);
  protected userMenuOpen = signal(false);
  protected loading = signal(false);

  protected sectorControl = new FormControl<string | null>(null);
  protected industryControl = new FormControl<string | null>(null);

  protected get userName(): string | null {
    const user = this.stackAuthService.currentUser();
    return user?.displayName ?? user?.email?.split('@')[0] ?? null;
  }

  ngOnInit(): void {
    this.wrcfApi.listSectors().subscribe(sectors => {
      this.sectors.set(sectors);
      if (sectors.length > 0) {
        this.sectorControl.setValue(sectors[0].id, { emitEvent: false });
        this.onSectorChange(sectors[0].id);
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
      this.industries.set(industries);
      if (industries.length > 0) {
        this.industryControl.setValue(industries[0].id, { emitEvent: false });
        this.onIndustryChange(industries[0].id);
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
