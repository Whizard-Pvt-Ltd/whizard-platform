import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StackAuthService } from '../../core/services/stack-auth.service';
import { WrcfMockService } from './services/wrcf-mock.service';
import { WrcfColumnComponent } from './components/wrcf-column/wrcf-column.component';
import { WrcfPanelComponent } from './components/wrcf-panel/wrcf-panel.component';
import {
  IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject,
  SecondaryWorkObject, Capability, ProficiencyLevel,
  EntityType, PanelState, WrcfEntity
} from './models/wrcf.models';

@Component({
  selector: 'whizard-industry-wrcf',
  standalone: true,
  imports: [FormsModule, RouterLink, WrcfColumnComponent, WrcfPanelComponent],
  templateUrl: './industry-wrcf.component.html',
  styleUrl: './industry-wrcf.component.css',
})
export class IndustryWrcfComponent implements OnInit {
  private readonly mockService = inject(WrcfMockService);
  private readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);

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

  protected get userName(): string | null {
    return this.stackAuthService.currentUser()?.displayName ?? null;
  }

  ngOnInit(): void {
    this.sectors = this.mockService.getSectors();
    this.capabilities = this.mockService.getCapabilities();
    this.proficiencyLevels = this.mockService.getProficiencyLevels();
  }

  protected onSectorChange(sectorId: string): void {
    this.selectedSectorId.set(sectorId);
    this.selectedIndustryId.set('');
    this.resetFromIndustry();
    this.industries.set(this.mockService.getIndustries(sectorId));
  }

  protected onIndustryChange(industryId: string): void {
    this.selectedIndustryId.set(industryId);
    this.resetFromIndustry();
    this.fgList.set(this.mockService.getFGs(industryId));
  }

  protected onFGSelect(item: WrcfEntity): void {
    this.selectedFG.set(item as FunctionalGroup);
    this.selectedPWO.set(null);
    this.selectedSWO.set(null);
    this.pwoList.set(this.mockService.getPWOs(item.id));
    this.swoList.set([]);
  }

  protected onPWOSelect(item: WrcfEntity): void {
    this.selectedPWO.set(item as PrimaryWorkObject);
    this.selectedSWO.set(null);
    this.swoList.set(this.mockService.getSWOs(item.id));
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

    this.closePanel();
  }

  protected onPanelDelete(id: string): void {
    const { entityType } = this.panel();
    let result;

    if (entityType === 'FG') {
      result = this.mockService.deleteFG(id);
      if (result.success) {
        this.fgList.set(this.mockService.getFGs(this.selectedIndustryId()));
        if (this.selectedFG()?.id === id) {
          this.selectedFG.set(null);
          this.pwoList.set([]);
          this.swoList.set([]);
        }
      }
    } else if (entityType === 'PWO') {
      result = this.mockService.deletePWO(id);
      if (result.success) {
        this.pwoList.set(this.mockService.getPWOs(this.selectedFG()!.id));
        if (this.selectedPWO()?.id === id) {
          this.selectedPWO.set(null);
          this.swoList.set([]);
        }
      }
    } else {
      result = this.mockService.deleteSWO(id);
      if (result.success) {
        this.swoList.set(this.mockService.getSWOs(this.selectedPWO()!.id));
        if (this.selectedSWO()?.id === id) this.selectedSWO.set(null);
      }
    }

    if (result?.success) {
      this.closePanel();
    } else {
      this.showError(result?.reason ?? 'Delete failed.');
    }
  }

  protected logout(): void {
    this.stackAuthService.signOut();
  }

  private handleCreate(entityType: EntityType, payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>): void {
    if (entityType === 'FG') {
      this.mockService.createFG({ ...(payload as Omit<FunctionalGroup, 'id'>), industryId: this.selectedIndustryId() });
      this.fgList.set(this.mockService.getFGs(this.selectedIndustryId()));
    } else if (entityType === 'PWO') {
      this.mockService.createPWO({ ...(payload as Omit<PrimaryWorkObject, 'id'>), functionalGroupId: this.selectedFG()!.id });
      this.pwoList.set(this.mockService.getPWOs(this.selectedFG()!.id));
    } else {
      this.mockService.createSWO({ ...(payload as Omit<SecondaryWorkObject, 'id'>), primaryWorkObjectId: this.selectedPWO()!.id });
      this.swoList.set(this.mockService.getSWOs(this.selectedPWO()!.id));
    }
  }

  private handleUpdate(entityType: EntityType, payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>): void {
    const id = (payload as { id?: string }).id!;
    if (entityType === 'FG') {
      this.mockService.updateFG(id, payload as Partial<FunctionalGroup>);
      this.fgList.set(this.mockService.getFGs(this.selectedIndustryId()));
    } else if (entityType === 'PWO') {
      this.mockService.updatePWO(id, payload as Partial<PrimaryWorkObject>);
      this.pwoList.set(this.mockService.getPWOs(this.selectedFG()!.id));
    } else {
      this.mockService.updateSWO(id, payload as Partial<SecondaryWorkObject>);
      this.swoList.set(this.mockService.getSWOs(this.selectedPWO()!.id));
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
