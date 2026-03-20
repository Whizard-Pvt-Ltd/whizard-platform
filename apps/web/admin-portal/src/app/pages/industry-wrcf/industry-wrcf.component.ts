import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StackAuthService } from '../../core/services/stack-auth.service';
import { WrcfApiService } from './services/wrcf-api.service';
import { WrcfColumnComponent } from './components/wrcf-column/wrcf-column.component';
import { WrcfPanelComponent } from './components/wrcf-panel/wrcf-panel.component';
import {
  IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject,
  SecondaryWorkObject, Capability, ProficiencyLevel,
  EntityType, PanelState, WrcfEntity
} from './models/wrcf.models';
import { CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from './models/wrcf-impact-levels';

@Component({
  selector: 'whizard-industry-wrcf',
  standalone: true,
  imports: [FormsModule, RouterLink, WrcfColumnComponent, WrcfPanelComponent],
  templateUrl: './industry-wrcf.component.html',
  styleUrl: './industry-wrcf.component.css',
})
export class IndustryWrcfComponent implements OnInit {
  private readonly apiService = inject(WrcfApiService);
  private readonly stackAuthService = inject(StackAuthService);

  protected sectors: IndustrySector[] = [];
  protected capabilities: Capability[] = [];
  protected proficiencyLevels: ProficiencyLevel[] = [];

  protected selectedSectorId = signal<string>('');
  protected selectedIndustryId = signal<string>('');
  protected selectedFG = signal<FunctionalGroup | null>(null);
  protected selectedPWO = signal<PrimaryWorkObject | null>(null);
  protected selectedSWO = signal<SecondaryWorkObject | null>(null);
  protected selectedCapabilityId = signal<string | null>(null);
  protected selectedProficiencyId = signal<string | null>(null);

  protected industries = signal<Industry[]>([]);
  protected fgList = signal<FunctionalGroup[]>([]);
  protected pwoList = signal<PrimaryWorkObject[]>([]);
  protected swoList = signal<SecondaryWorkObject[]>([]);

  protected panel = signal<PanelState>({ open: false, mode: 'create', entityType: 'FG' });
  protected errorMessage = signal<string>('');
  protected userMenuOpen = signal<boolean>(false);

  protected get userName(): string | null {
    return this.stackAuthService.currentUser()?.displayName ?? null;
  }

  ngOnInit(): void {
    this.apiService.listSectors().subscribe({
      next: sectors => { this.sectors = sectors; },
      error: () => { this.sectors = []; }
    });

    this.apiService.listCapabilities().subscribe({
      next: caps => { this.capabilities = caps; },
      error: () => { this.capabilities = []; }
    });

    this.apiService.listProficiencies().subscribe({
      next: profs => { this.proficiencyLevels = profs; },
      error: () => { this.proficiencyLevels = []; }
    });
  }

  protected onSectorChange(sectorId: string): void {
    this.selectedSectorId.set(sectorId);
    this.selectedIndustryId.set('');
    this.resetFromIndustry();
    this.apiService.listIndustries(sectorId).subscribe({
      next: industries => this.industries.set(industries),
      error: () => this.industries.set([])
    });
  }

  protected onIndustryChange(industryId: string): void {
    this.selectedIndustryId.set(industryId);
    this.resetFromIndustry();
    this.apiService.listFGs(industryId).subscribe({
      next: fgs => this.fgList.set(fgs),
      error: () => this.fgList.set([])
    });
  }

  protected onFGSelect(item: WrcfEntity): void {
    this.selectedFG.set(item as FunctionalGroup);
    this.selectedPWO.set(null);
    this.selectedSWO.set(null);
    this.swoList.set([]);
    this.apiService.listPWOs(item.id).subscribe({
      next: pwos => this.pwoList.set(pwos),
      error: () => this.pwoList.set([])
    });
  }

  protected onPWOSelect(item: WrcfEntity): void {
    this.selectedPWO.set(item as PrimaryWorkObject);
    this.selectedSWO.set(null);
    this.apiService.listSWOs(item.id).subscribe({
      next: swos => this.swoList.set(swos),
      error: () => this.swoList.set([])
    });
  }

  protected onSWOSelect(item: WrcfEntity): void {
    this.selectedSWO.set(item as SecondaryWorkObject);
  }

  protected onCapabilitySelect(item: WrcfEntity): void {
    this.selectedCapabilityId.set(item.id);
  }

  protected onProficiencySelect(item: WrcfEntity): void {
    this.selectedProficiencyId.set(item.id);
  }

  protected openPanel(mode: 'create' | 'edit', entityType: EntityType, data?: WrcfEntity): void {
    this.panel.set({
      open: true,
      mode,
      entityType,
      data: mode === 'edit' ? data as FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject : undefined,
    });
  }

  protected closePanel(): void {
    this.panel.set({ ...this.panel(), open: false });
  }

  protected onPanelSave(payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>): void {
    const { entityType, mode } = this.panel();
    if (mode === 'create') {
      this.handleCreate(entityType, payload);
    } else {
      this.handleUpdate(entityType, payload);
    }
  }

  protected onPanelDelete(id: string): void {
    const { entityType } = this.panel();

    if (entityType === 'FG') {
      this.apiService.deleteFG(id).subscribe({
        next: () => {
          this.apiService.listFGs(this.selectedIndustryId()).subscribe({
            next: fgs => {
              this.fgList.set(fgs);
              if (this.selectedFG()?.id === id) {
                this.selectedFG.set(null);
                this.pwoList.set([]);
                this.swoList.set([]);
              }
              this.closePanel();
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.error?.message ?? 'Delete failed.';
          this.showError(msg);
        }
      });
    } else if (entityType === 'PWO') {
      this.apiService.deletePWO(id).subscribe({
        next: () => {
          this.apiService.listPWOs(this.selectedFG()!.id).subscribe({
            next: pwos => {
              this.pwoList.set(pwos);
              if (this.selectedPWO()?.id === id) {
                this.selectedPWO.set(null);
                this.swoList.set([]);
              }
              this.closePanel();
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.error?.message ?? 'Delete failed.';
          this.showError(msg);
        }
      });
    } else {
      this.apiService.deleteSWO(id).subscribe({
        next: () => {
          this.apiService.listSWOs(this.selectedPWO()!.id).subscribe({
            next: swos => {
              this.swoList.set(swos);
              if (this.selectedSWO()?.id === id) this.selectedSWO.set(null);
              this.closePanel();
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.error?.message ?? 'Delete failed.';
          this.showError(msg);
        }
      });
    }
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    if (this.userMenuOpen() && !target.closest('.avatar-wrapper')) {
      this.userMenuOpen.set(false);
    }
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.stackAuthService.signOut();
  }

  private handleCreate(entityType: EntityType, payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>): void {
    if (entityType === 'FG') {
      const fg = payload as Partial<FunctionalGroup>;
      this.apiService.createFG({
        industryId: this.selectedIndustryId(),
        name: fg.name!,
        description: fg.description,
        domainType: fg.domainType ?? 'Operations'
      }).subscribe({
        next: () => {
          this.apiService.listFGs(this.selectedIndustryId()).subscribe({
            next: fgs => { this.fgList.set(fgs); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to create Functional Group.')
      });
    } else if (entityType === 'PWO') {
      const pwo = payload as Partial<PrimaryWorkObject>;
      this.apiService.createPWO({
        functionalGroupId: this.selectedFG()!.id,
        name: pwo.name!,
        description: pwo.description,
        strategicImportance: pwo.strategicImportance ?? 3,
        revenueImpact: pwo.revenueImpact ?? CRITICALITY_LEVELS[1],
        downtimeSensitivity: pwo.downtimeSensitivity ?? CRITICALITY_LEVELS[1]
      }).subscribe({
        next: () => {
          this.apiService.listPWOs(this.selectedFG()!.id).subscribe({
            next: pwos => { this.pwoList.set(pwos); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to create Primary Work Object.')
      });
    } else {
      const swo = payload as Partial<SecondaryWorkObject>;
      this.apiService.createSWO({
        pwoId: this.selectedPWO()!.id,
        name: swo.name!,
        description: swo.description,
        operationalComplexity: swo.operationalComplexity ?? COMPLEXITY_LEVELS[1],
        assetCriticality: swo.assetCriticality ?? CRITICALITY_LEVELS[1],
        failureFrequency: swo.failureFrequency ?? FREQUENCY_LEVELS[0]
      }).subscribe({
        next: () => {
          this.apiService.listSWOs(this.selectedPWO()!.id).subscribe({
            next: swos => { this.swoList.set(swos); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to create Secondary Work Object.')
      });
    }
  }

  private handleUpdate(entityType: EntityType, payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>): void {
    const id = (payload as { id?: string }).id!;

    if (entityType === 'FG') {
      const fg = payload as Partial<FunctionalGroup>;
      this.apiService.updateFG(id, { name: fg.name, description: fg.description, domainType: fg.domainType }).subscribe({
        next: () => {
          this.apiService.listFGs(this.selectedIndustryId()).subscribe({
            next: fgs => { this.fgList.set(fgs); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to update Functional Group.')
      });
    } else if (entityType === 'PWO') {
      const pwo = payload as Partial<PrimaryWorkObject>;
      this.apiService.updatePWO(id, {
        name: pwo.name,
        description: pwo.description,
        strategicImportance: pwo.strategicImportance,
        revenueImpact: pwo.revenueImpact,
        downtimeSensitivity: pwo.downtimeSensitivity
      }).subscribe({
        next: () => {
          this.apiService.listPWOs(this.selectedFG()!.id).subscribe({
            next: pwos => { this.pwoList.set(pwos); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to update Primary Work Object.')
      });
    } else {
      const swo = payload as Partial<SecondaryWorkObject>;
      this.apiService.updateSWO(id, {
        name: swo.name,
        description: swo.description,
        operationalComplexity: swo.operationalComplexity,
        assetCriticality: swo.assetCriticality,
        failureFrequency: swo.failureFrequency
      }).subscribe({
        next: () => {
          this.apiService.listSWOs(this.selectedPWO()!.id).subscribe({
            next: swos => { this.swoList.set(swos); this.closePanel(); }
          });
        },
        error: () => this.showError('Failed to update Secondary Work Object.')
      });
    }
  }

  private resetFromIndustry(): void {
    this.selectedFG.set(null);
    this.selectedPWO.set(null);
    this.selectedSWO.set(null);
    this.fgList.set([]);
    this.pwoList.set([]);
    this.swoList.set([]);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }
}
