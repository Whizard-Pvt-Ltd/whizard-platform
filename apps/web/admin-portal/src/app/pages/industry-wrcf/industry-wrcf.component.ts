import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ScrollbarDirective } from '@whizard/shared-ui';
import { forkJoin } from 'rxjs';
import { ManageCIMappingsComponent } from './components/manage-ci-mappings/manage-ci-mappings.component';
import { WrcfColumnComponent } from './components/wrcf-column/wrcf-column.component';
import { WrcfPanelComponent } from './components/wrcf-panel/wrcf-panel.component';
import { CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from './models/wrcf-impact-levels';
import {
  IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject,
  SecondaryWorkObject, Capability, ProficiencyLevel,
  EntityType, PanelState, WrcfEntity, CIPendingEntry, CapabilityInstance
} from './models/wrcf.models';
import { WrcfApiService } from './services/wrcf-api.service';

@Component({
  selector: 'whizard-industry-wrcf',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, WrcfColumnComponent, WrcfPanelComponent, ManageCIMappingsComponent, ScrollbarDirective],
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
  templateUrl: './industry-wrcf.component.html',
  styleUrl: './industry-wrcf.component.css',
})
export class IndustryWrcfComponent implements OnInit {
  private readonly apiService = inject(WrcfApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected sectors: IndustrySector[] = [];
  protected capabilities: Capability[] = [];
  protected proficiencyLevels: ProficiencyLevel[] = [];

  protected selectedSectorId = signal<string>('');
  protected selectedIndustryId = signal<string>('');

  protected sectorControl = new FormControl<string>('');
  protected industryControl = new FormControl<string>({ value: '', disabled: true });
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
  protected panelError = signal<string>('');

  protected ciCache = signal<CIPendingEntry[]>([]);
  protected existingCIs = signal<CapabilityInstance[]>([]);
  protected toastMessage = signal<string>('');
  protected mappingDialogOpen = signal<boolean>(false);

  protected get checkedProficiencyIds(): string[] {
    const swoId = this.selectedSWO()?.id;
    const capId = this.selectedCapabilityId();
    if (!swoId || !capId) return [];
    return this.ciCache()
      .filter(e => e.swoId === swoId && e.capabilityId === capId)
      .map(e => e.proficiencyId);
  }

  protected get savedProficiencyIds(): string[] {
    const swoId = this.selectedSWO()?.id;
    const capId = this.selectedCapabilityId();
    if (!swoId || !capId) return [];
    return this.existingCIs()
      .filter(ci => ci.swoId === swoId && ci.capabilityId === capId)
      .map(ci => ci.proficiencyId);
  }

  protected get profCheckboxMode(): boolean {
    return !!(this.selectedSWO() && this.selectedCapabilityId());
  }

  ngOnInit(): void {
    this.sectorControl.valueChanges.subscribe(id => {
      if (id) this.onSectorChange(id);
    });
    this.industryControl.valueChanges.subscribe(id => {
      if (id) this.onIndustryChange(id);
    });

    this.apiService.listSectors().subscribe({
      next: sectors => {
        this.sectors = [...sectors].sort((a, b) => a.name.localeCompare(b.name));

        const requestedSectorId = this.route.snapshot.queryParamMap.get('sectorId');
        const requestedIndustryId = this.route.snapshot.queryParamMap.get('industryId');
        const initialSectorId = this.sectors.some(s => s.id === requestedSectorId)
          ? requestedSectorId ?? ''
          : this.sectors[0]?.id ?? '';

        if (initialSectorId) {
          this.loadIndustriesForSector(initialSectorId, requestedIndustryId);
        }
      },
      error: () => { this.sectors = []; }
    });

    this.apiService.listCapabilities().subscribe({
      next: caps => {
        this.capabilities = caps;
        if (caps.length > 0 && this.selectedSWO()) {
          this.onCapabilitySelect(caps[0]);
        }
      },
      error: () => { this.capabilities = []; }
    });

    this.apiService.listProficiencies().subscribe({
      next: profs => {
        this.proficiencyLevels = profs;
        if (profs.length > 0 && this.selectedCapabilityId()) {
          this.onProficiencySelect(profs[0]);
        }
      },
      error: () => { this.proficiencyLevels = []; }
    });
  }

  protected onSectorChange(sectorId: string): void {
    this.loadIndustriesForSector(sectorId);
  }

  protected onIndustryChange(industryId: string): void {
    this.selectedIndustryId.set(industryId);
    this.industryControl.setValue(industryId, { emitEvent: false });
    this.resetFromIndustry();
    this.apiService.listFGs(industryId).subscribe({
      next: fgs => {
        const sorted = [...fgs].sort((a, b) => a.name.localeCompare(b.name));
        this.fgList.set(sorted);
        if (sorted.length > 0) this.onFGSelect(sorted[0]);
      },
      error: () => this.fgList.set([])
    });
  }

  protected onFGSelect(item: WrcfEntity): void {
    this.selectedFG.set(item as FunctionalGroup);
    this.selectedPWO.set(null);
    this.selectedSWO.set(null);
    this.swoList.set([]);
    this.existingCIs.set([]);
    this.apiService.listCIs(this.selectedIndustryId(), item.id).subscribe({
      next: cis => this.existingCIs.set(cis),
      error: () => this.existingCIs.set([])
    });
    this.apiService.listPWOs(item.id).subscribe({
      next: pwos => {
        const sorted = [...pwos].sort((a, b) => a.name.localeCompare(b.name));
        this.pwoList.set(sorted);
        if (sorted.length > 0) this.onPWOSelect(sorted[0]);
      },
      error: () => this.pwoList.set([])
    });
  }

  protected onPWOSelect(item: WrcfEntity): void {
    this.selectedPWO.set(item as PrimaryWorkObject);
    this.selectedSWO.set(null);
    this.apiService.listSWOs(item.id).subscribe({
      next: swos => {
        const sorted = [...swos].sort((a, b) => a.name.localeCompare(b.name));
        this.swoList.set(sorted);
        if (sorted.length > 0) this.onSWOSelect(sorted[0]);
      },
      error: () => this.swoList.set([])
    });
  }

  protected onSWOSelect(item: WrcfEntity): void {
    this.selectedSWO.set(item as SecondaryWorkObject);
    if (this.capabilities.length > 0) this.onCapabilitySelect(this.capabilities[0]);
  }

  protected onCapabilitySelect(item: WrcfEntity): void {
    this.selectedCapabilityId.set(item.id);
    if (this.proficiencyLevels.length > 0) this.onProficiencySelect(this.proficiencyLevels[0]);
  }

  protected onProficiencySelect(item: WrcfEntity): void {
    this.selectedProficiencyId.set(item.id);
  }

  protected onProficiencyToggle(item: WrcfEntity): void {
    const swo = this.selectedSWO();
    const fg = this.selectedFG();
    const pwo = this.selectedPWO();
    const capId = this.selectedCapabilityId();
    if (!swo || !fg || !pwo || !capId) return;

    const cap = this.capabilities.find(c => c.id === capId);
    if (!cap) return;

    if (this.savedProficiencyIds.includes(item.id)) {
      this.showToast('This capability instance already exists in the saved mappings.');
      return;
    }

    const existing = this.ciCache().find(
      e => e.swoId === swo.id && e.capabilityId === capId && e.proficiencyId === item.id
    );

    if (existing) {
      this.ciCache.update(cache => cache.filter(e => e.localId !== existing.localId));
    } else {
      const prof = this.proficiencyLevels.find(p => p.id === item.id);
      if (!prof) return;
      const levelMatch = prof.name.match(/^L(\d+)/);
      const entry: CIPendingEntry = {
        localId: crypto.randomUUID(),
        industryId: this.selectedIndustryId(),
        fgId: fg.id,
        fgName: fg.name,
        pwoId: pwo.id,
        pwoName: pwo.name,
        swoId: swo.id,
        swoName: swo.name,
        capabilityId: cap.id,
        capabilityCode: cap.code ?? '',
        capabilityName: cap.name,
        proficiencyId: item.id,
        proficiencyLevel: prof.level,
        proficiencyLabel: prof.name
      };
      this.ciCache.update(cache => [...cache, entry]);
      this.showToast('New capability instance is added to cached map.');
    }
  }

  protected onPendingCIRemoved(localId: string): void {
    this.ciCache.update(cache => cache.filter(e => e.localId !== localId));
  }

  protected onCISave(pending: CIPendingEntry[]): void {
    const calls = pending.map(e =>
      this.apiService.createCI({
        functionalGroupId: e.fgId,
        pwoId: e.pwoId ?? '',
        swoId: e.swoId ?? '',
        capabilityId: e.capabilityId,
        proficiencyId: e.proficiencyId
      })
    );
    forkJoin(calls).subscribe({
      next: () => {
        this.ciCache.set([]);
        this.mappingDialogOpen.set(false);
        const fg = this.selectedFG();
        if (fg) {
          this.apiService.listCIs(this.selectedIndustryId(), fg.id).subscribe({
            next: cis => this.existingCIs.set(cis),
            error: () => { }
          });
        }
      },
      error: () => this.showError('Failed to save some capability instances.')
    });
  }

  protected onAddSkillsClick(): void {
    const industryId = this.selectedIndustryId();
    if (!industryId) {
      this.showError('Please select an Industry Sector and Industry first.');
      return;
    }

    this.router.navigate(['/wrcf-skills'], {
      queryParams: {
        industryId,
        fgId: this.selectedFG()?.id ?? null,
        pwoId: this.selectedPWO()?.id ?? null,
        swoId: this.selectedSWO()?.id ?? null,
        capabilityId: this.selectedCapabilityId() || null,
        proficiencyId: this.selectedProficiencyId() || null
      }
    });
  }

  protected onCISavedDeleted(id: string): void {
    this.apiService.deleteCI(id).subscribe({
      error: () => this.showError('Failed to delete capability instance.')
    });
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  protected openPanel(mode: 'create' | 'edit', entityType: EntityType, data?: WrcfEntity): void {
    this.panelError.set('');
    this.panel.set({
      open: true,
      mode,
      entityType,
      data: mode === 'edit' ? data as FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject : undefined,
    });
  }

  protected closePanel(): void {
    this.panelError.set('');
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
              this.fgList.set([...fgs].sort((a, b) => a.name.localeCompare(b.name)));
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
          this.panelError.set(msg);
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
          this.panelError.set(msg);
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
          this.panelError.set(msg);
        }
      });
    }
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
            next: fgs => { this.fgList.set([...fgs].sort((a, b) => a.name.localeCompare(b.name))); this.closePanel(); }
          });
        },
        error: (err: HttpErrorResponse) => this.showError(err.error?.error?.message ?? 'Failed to create Functional Group.')
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
            next: fgs => { this.fgList.set([...fgs].sort((a, b) => a.name.localeCompare(b.name))); this.closePanel(); }
          });
        },
        error: (err: HttpErrorResponse) => this.showError(err.error?.error?.message ?? 'Failed to update Functional Group.')
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
    this.existingCIs.set([]);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }

  private loadIndustriesForSector(sectorId: string, preferredIndustryId?: string | null): void {
    this.selectedSectorId.set(sectorId);
    this.sectorControl.setValue(sectorId, { emitEvent: false });
    this.selectedIndustryId.set('');
    this.industryControl.setValue('', { emitEvent: false });
    this.industryControl.disable({ emitEvent: false });
    this.resetFromIndustry();

    this.apiService.listIndustries(sectorId).subscribe({
      next: industries => {
        this.industries.set([...industries].sort((a, b) => a.name.localeCompare(b.name)));
        this.industryControl.enable({ emitEvent: false });

        const sorted = this.industries();
        const initialIndustryId = sorted.some(i => i.id === preferredIndustryId)
          ? preferredIndustryId ?? ''
          : sorted[0]?.id ?? '';

        if (initialIndustryId) {
          this.onIndustryChange(initialIndustryId);
        }
      },
      error: () => this.industries.set([])
    });
  }
}
