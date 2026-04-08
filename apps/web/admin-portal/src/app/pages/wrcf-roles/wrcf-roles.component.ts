import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScrollbarDirective } from '@whizard/shared-ui';
import { forkJoin } from 'rxjs';
import type { IndustrySector, Industry, FunctionalGroup, PrimaryWorkObject, SecondaryWorkObject, Capability, ProficiencyLevel, CapabilityInstance } from '../industry-wrcf/models/wrcf.models';
import type { Department, IndustryRole, PendingCIMapping, RolesPanelState } from './models/wrcf-roles.models';
import { WrcfColumnComponent } from '../industry-wrcf/components/wrcf-column/wrcf-column.component';
import { WrcfApiService } from '../industry-wrcf/services/wrcf-api.service';
import { CIMappingsDialogComponent } from './components/ci-mappings-dialog/ci-mappings-dialog.component';
import { RolesPanelComponent } from './components/roles-panel/roles-panel.component';
import { WrcfRolesApiService } from './services/wrcf-roles-api.service';

@Component({
  selector: 'whizard-wrcf-roles',
  standalone: true,
  imports: [FormsModule, WrcfColumnComponent, RolesPanelComponent, CIMappingsDialogComponent, ScrollbarDirective],
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
  templateUrl: './wrcf-roles.component.html',
  styleUrl: './wrcf-roles.component.css'
})
export class WrcfRolesComponent implements OnInit {
  private readonly wrcfApi = inject(WrcfApiService);
  private readonly rolesApi = inject(WrcfRolesApiService);
  protected sectors = signal<IndustrySector[]>([]);
  protected industries = signal<Industry[]>([]);
  protected departments = signal<Department[]>([]);
  protected roles = signal<IndustryRole[]>([]);

  protected selectedSectorId = signal<string | null>(null);
  protected selectedIndustryId = signal<string | null>(null);
  protected selectedDepartmentId = signal('');
  protected selectedRoleId = signal<string | null>(null);

  protected allFGs = signal<FunctionalGroup[]>([]);
  protected deptFGs = signal<FunctionalGroup[]>([]);
  protected pwoList = signal<PrimaryWorkObject[]>([]);
  protected swoList = signal<SecondaryWorkObject[]>([]);
  protected allCIs = signal<CapabilityInstance[]>([]);

  private allCapabilities: Capability[] = [];
  private allProficiencies: ProficiencyLevel[] = [];

  protected selectedFGId = signal<string | null>(null);
  protected selectedPWOId = signal<string | null>(null);
  protected selectedSWOId = signal<string | null>(null);
  protected selectedCapabilityId = signal<string | null>(null);
  protected checkedProficiencyIds = signal<string[]>([]);

  protected pendingMappings = signal<PendingCIMapping[]>([]);
  protected mappingCount = computed(() => this.pendingMappings().length);

  protected panel = signal<RolesPanelState>({ open: false, mode: 'create', entity: 'Department' });
  protected mappingsDialogOpen = signal(false);
  protected addDropdownOpen = signal(false);
  protected editDropdownOpen = signal(false);
  protected errorMessage = signal<string | null>(null);

  protected get availableCapabilities(): Capability[] {
    const swoId = this.selectedSWOId();
    if (!swoId) return [];
    const capIds = new Set(this.allCIs().filter(ci => ci.swoId === swoId).map(ci => ci.capabilityId));
    return this.allCapabilities.filter(c => capIds.has(c.id));
  }

  protected get availableProficiencies(): ProficiencyLevel[] {
    const swoId = this.selectedSWOId();
    const capId = this.selectedCapabilityId();
    if (!swoId || !capId) return [];
    const profIds = new Set(this.allCIs().filter(ci => ci.swoId === swoId && ci.capabilityId === capId).map(ci => ci.proficiencyId));
    return this.allProficiencies.filter(p => profIds.has(p.id));
  }

  protected get deptFGsAsEntities(): { id: string; name: string }[] {
    return this.deptFGs().map(fg => ({ id: fg.id, name: fg.name }));
  }

  protected get pwoListAsEntities(): { id: string; name: string }[] {
    return this.pwoList().map(p => ({ id: p.id, name: p.name }));
  }

  protected get swoListAsEntities(): { id: string; name: string }[] {
    return this.swoList().map(s => ({ id: s.id, name: s.name }));
  }

  protected get capabilitiesAsEntities(): { id: string; name: string }[] {
    return this.availableCapabilities.map(c => ({ id: c.id, name: c.name }));
  }

  protected get proficienciesAsEntities(): { id: string; name: string }[] {
    return this.availableProficiencies.map(p => ({ id: p.id, name: p.name }));
  }

  protected get selectedIndustryName(): string {
    return this.industries().find(i => i.id === this.selectedIndustryId())?.name ?? '';
  }

  protected get selectedDepartmentName(): string {
    return this.departments().find(d => d.id === this.selectedDepartmentId())?.name ?? '';
  }

  protected get selectedRoleName(): string {
    return this.roles().find(r => r.id === this.selectedRoleId())?.name ?? '';
  }

  ngOnInit(): void {
    this.wrcfApi.listCapabilities().subscribe({ next: c => { this.allCapabilities = c; }, error: () => {} });
    this.wrcfApi.listProficiencies().subscribe({ next: p => { this.allProficiencies = p; }, error: () => {} });

    this.wrcfApi.listSectors().subscribe({
      next: sectors => {
        this.sectors.set(sectors);
        if (sectors.length === 0) return;
        this.selectSector(sectors[0].id, false);
      },
      error: () => {}
    });
  }

  private selectSector(sectorId: string, guard: boolean): void {
    if (guard && this.pendingMappings().length > 0) {
      const proceed = confirm('You have unsaved CI mappings. Discard and continue?');
      if (!proceed) return;
      this.pendingMappings.set([]);
    }

    this.selectedSectorId.set(sectorId);
    this.industries.set([]);
    this.selectedIndustryId.set(null);
    this.departments.set([]);
    this.roles.set([]);
    this.selectedDepartmentId.set('');
    this.selectedRoleId.set(null);
    this.resetColumns();

    this.wrcfApi.listIndustries(sectorId).subscribe({
      next: industries => {
        this.industries.set(industries);
        if (industries.length > 0) {
          this.selectIndustry(industries[0].id);
        }
      },
      error: () => {}
    });
  }

  protected onSectorChange(sectorId: string): void {
    if (!sectorId) return;
    this.selectSector(sectorId, true);
  }

  private selectIndustry(industryId: string): void {
    this.selectedIndustryId.set(industryId);
    this.departments.set([]);
    this.roles.set([]);
    this.selectedDepartmentId.set('');
    this.selectedRoleId.set(null);
    this.resetColumns();

    forkJoin({
      fgs: this.wrcfApi.listFGs(industryId),
      depts: this.rolesApi.listDepartments(industryId)
    }).subscribe({
      next: ({ fgs, depts }) => {
        this.allFGs.set(fgs);
        this.departments.set(depts);
        if (depts.length > 0) {
          this.selectDepartment(depts[0].id, false);
        }
      },
      error: () => {}
    });
  }

  protected onIndustryChange(industryId: string): void {
    if (this.pendingMappings().length > 0) {
      const proceed = confirm('You have unsaved CI mappings. Discard and continue?');
      if (!proceed) return;
      this.pendingMappings.set([]);
    }
    this.selectIndustry(industryId);
  }

  private selectDepartment(deptId: string, guard: boolean): void {
    if (guard && this.pendingMappings().length > 0) {
      const proceed = confirm('You have unsaved CI mappings. Discard and continue?');
      if (!proceed) return;
      this.pendingMappings.set([]);
    }
    this.selectedDepartmentId.set(deptId);
    this.roles.set([]);
    this.selectedRoleId.set(null);
    this.resetColumns();

    const dept = this.departments().find(d => d.id === deptId);
    if (dept) {
      const fgs = this.allFGs().filter(fg => dept.functionalGroupIds.includes(fg.id));
      this.deptFGs.set(fgs);
      if (fgs.length > 0) {
        this.onFGSelect(fgs[0].id);
      }
    }

    this.rolesApi.listRoles(deptId).subscribe({
      next: roles => {
        this.roles.set(roles);
        if (roles.length > 0) {
          this.selectedRoleId.set(roles[0].id);
        }
      },
      error: () => {}
    });
  }

  protected onDepartmentChange(deptId: string): void {
    this.selectDepartment(deptId, true);
  }

  protected onRoleChange(roleId: string): void {
    if (this.pendingMappings().length > 0) {
      const proceed = confirm('You have unsaved CI mappings. Discard and continue?');
      if (!proceed) return;
      this.pendingMappings.set([]);
    }
    this.selectedRoleId.set(roleId);
  }

  protected onFGSelect(fgId: string): void {
    this.selectedFGId.set(fgId);
    this.selectedPWOId.set(null);
    this.selectedSWOId.set(null);
    this.selectedCapabilityId.set(null);
    this.checkedProficiencyIds.set([]);
    this.pwoList.set([]);
    this.swoList.set([]);
    this.allCIs.set([]);

    if (fgId) {
      const industryId = this.selectedIndustryId() ?? undefined;
      this.wrcfApi.listPWOs(fgId).subscribe({
        next: pwos => {
          this.pwoList.set(pwos);
          if (pwos.length > 0) this.onPWOSelect(pwos[0].id);
        },
        error: () => this.pwoList.set([])
      });
      this.wrcfApi.listCIs(industryId, fgId).subscribe({
        next: cis => this.allCIs.set(cis),
        error: () => this.allCIs.set([])
      });
    }
  }

  protected onPWOSelect(pwoId: string): void {
    this.selectedPWOId.set(pwoId);
    this.selectedSWOId.set(null);
    this.selectedCapabilityId.set(null);
    this.checkedProficiencyIds.set([]);
    this.swoList.set([]);

    if (pwoId) {
      this.wrcfApi.listSWOs(pwoId).subscribe({
        next: swos => {
          this.swoList.set(swos);
          if (swos.length > 0) this.onSWOSelect(swos[0].id);
        },
        error: () => this.swoList.set([])
      });
    }
  }

  protected onSWOSelect(swoId: string): void {
    this.selectedSWOId.set(swoId);
    this.selectedCapabilityId.set(null);
    this.checkedProficiencyIds.set([]);
  }

  protected onCapabilitySelect(capabilityId: string): void {
    this.selectedCapabilityId.set(capabilityId);
    this.checkedProficiencyIds.set([]);
  }

  protected isProficiencyChecked(profId: string): boolean {
    return this.checkedProficiencyIds().includes(profId);
  }

  protected toggleProficiency(profId: string): void {
    const swoId = this.selectedSWOId();
    const capId = this.selectedCapabilityId();
    if (!swoId || !capId) return;

    if (this.checkedProficiencyIds().includes(profId)) {
      this.checkedProficiencyIds.update(ids => ids.filter(id => id !== profId));
      this.pendingMappings.update(m => {
        const ci = this.allCIs().find(c => c.swoId === swoId && c.capabilityId === capId && c.proficiencyId === profId);
        if (!ci) return m;
        return m.filter(p => p.capabilityInstanceId !== ci.id);
      });
    } else {
      const ci = this.allCIs().find(c => c.swoId === swoId && c.capabilityId === capId && c.proficiencyId === profId);
      if (!ci) return;

      const fg = this.deptFGs().find(f => f.id === this.selectedFGId());
      const pwo = this.pwoList().find(p => p.id === this.selectedPWOId());
      const swo = this.swoList().find(s => s.id === swoId);
      const cap = this.allCapabilities.find(c => c.id === capId);
      const prof = this.allProficiencies.find(p => p.id === profId);

      if (!fg || !pwo || !swo || !cap || !prof) return;

      const entry: PendingCIMapping = {
        capabilityInstanceId: ci.id,
        fgName: fg.name,
        pwoName: pwo.name,
        swoName: swo.name,
        capabilityName: cap.name,
        proficiencyLabel: prof.name
      };

      this.checkedProficiencyIds.update(ids => [...ids, profId]);
      this.pendingMappings.update(m => [...m, entry]);
    }
  }

  protected openAddDropdown(): void {
    this.addDropdownOpen.update(v => !v);
    this.editDropdownOpen.set(false);
  }

  protected openEditDropdown(): void {
    this.editDropdownOpen.update(v => !v);
    this.addDropdownOpen.set(false);
  }

  protected openAddDepartment(): void {
    this.addDropdownOpen.set(false);
    this.panel.set({ open: true, mode: 'create', entity: 'Department' });
  }

  protected openAddRole(): void {
    this.addDropdownOpen.set(false);
    if (!this.selectedDepartmentId()) return;
    this.panel.set({ open: true, mode: 'create', entity: 'Role' });
  }

  protected openEditDepartment(): void {
    this.editDropdownOpen.set(false);
    const deptId = this.selectedDepartmentId();
    if (!deptId) return;
    const dept = this.departments().find(d => d.id === deptId);
    if (dept) this.panel.set({ open: true, mode: 'edit', entity: 'Department', data: dept });
  }

  protected openEditRole(): void {
    this.editDropdownOpen.set(false);
    const roleId = this.selectedRoleId();
    if (!roleId) return;
    const role = this.roles().find(r => r.id === roleId);
    if (role) this.panel.set({ open: true, mode: 'edit', entity: 'Role', data: role });
  }

  protected closePanel(): void {
    this.panel.update(s => ({ ...s, open: false }));
  }

  protected onPanelSave(payload: Partial<Department | IndustryRole>): void {
    const { entity, mode } = this.panel();
    const industryId = this.selectedIndustryId();
    const departmentId = this.selectedDepartmentId();

    if (entity === 'Department') {
      const p = payload as Partial<Department>;
      if (mode === 'create') {
        if (!industryId) return;
        this.rolesApi.createDepartment({
          name: p.name!,
          industryId: industryId ?? undefined,
          functionalGroupIds: p.functionalGroupIds ?? [],
          operationalCriticalityScore: p.operationalCriticalityScore,
          revenueContributionWeight: p.revenueContributionWeight,
          regulatoryExposureLevel: p.regulatoryExposureLevel
        }).subscribe({
          next: dept => {
            this.departments.update(d => [...d, dept]);
            this.closePanel();
          },
          error: () => this.showError('Failed to create department.')
        });
      } else {
        const id = (p as { id?: string }).id!;
        this.rolesApi.updateDepartment(id, {
          name: p.name,
          functionalGroupIds: p.functionalGroupIds,
          operationalCriticalityScore: p.operationalCriticalityScore,
          revenueContributionWeight: p.revenueContributionWeight,
          regulatoryExposureLevel: p.regulatoryExposureLevel
        }).subscribe({
          next: updated => {
            this.departments.update(d => d.map(dep => dep.id === id ? updated : dep));
            if (this.selectedDepartmentId() === id) {
              const fgs = this.allFGs().filter(fg => updated.functionalGroupIds.includes(fg.id));
              this.deptFGs.set(fgs);
            }
            this.closePanel();
          },
          error: () => this.showError('Failed to update department.')
        });
      }
    } else {
      const p = payload as Partial<IndustryRole>;
      if (mode === 'create') {
        if (!departmentId || !industryId) return;
        this.rolesApi.createRole({
          name: p.name!,
          departmentId,
          description: p.description,
          seniorityLevel: p.seniorityLevel!,
          reportingTo: p.reportingTo,
          roleCriticalityScore: p.roleCriticalityScore,
        }).subscribe({
          next: role => {
            this.roles.update(r => [...r, role]);
            this.selectedRoleId.set(role.id);
            this.closePanel();
          },
          error: () => this.showError('Failed to create role.')
        });
      } else {
        const id = (p as { id?: string }).id!;
        this.rolesApi.updateRole(id, {
          name: p.name,
          description: p.description
        }).subscribe({
          next: updated => {
            this.roles.update(r => r.map(role => role.id === id ? updated : role));
            this.closePanel();
          },
          error: () => this.showError('Failed to update role.')
        });
      }
    }
  }

  protected onPanelDelete(id: string): void {
    const { entity } = this.panel();
    if (entity === 'Department') {
      this.rolesApi.deleteDepartment(id).subscribe({
        next: () => {
          this.departments.update(d => d.filter(dep => dep.id !== id));
          if (this.selectedDepartmentId() === id) {
            this.selectedDepartmentId.set('');
            this.roles.set([]);
            this.selectedRoleId.set(null);
            this.resetColumns();
          }
          this.closePanel();
        },
        error: () => this.showError('Failed to delete department.')
      });
    } else {
      this.rolesApi.deleteRole(id).subscribe({
        next: () => {
          this.roles.update(r => r.filter(role => role.id !== id));
          if (this.selectedRoleId() === id) this.selectedRoleId.set(null);
          this.closePanel();
        },
        error: () => this.showError('Failed to delete role.')
      });
    }
  }

  protected openMappingsDialog(): void {
    this.mappingsDialogOpen.set(true);
  }

  protected closeMappingsDialog(): void {
    this.mappingsDialogOpen.set(false);
  }

  protected onRemoveMapping(index: number): void {
    this.pendingMappings.update(m => {
      const removed = m[index];
      const ci = this.allCIs().find(c => c.id === removed.capabilityInstanceId);
      if (ci) {
        this.checkedProficiencyIds.update(ids => ids.filter(id => id !== ci.proficiencyId));
      }
      return m.filter((_, i) => i !== index);
    });
  }

  protected onSaveMappings(): void {
    const roleId = this.selectedRoleId();
    if (!roleId) return;
    const capabilityInstanceIds = this.pendingMappings().map(m => m.capabilityInstanceId);
    this.rolesApi.saveRoleCIMappings(roleId, capabilityInstanceIds).subscribe({
      next: () => {
        this.pendingMappings.set([]);
        this.checkedProficiencyIds.set([]);
        this.mappingsDialogOpen.set(false);
      },
      error: () => this.showError('Failed to save CI mappings.')
    });
  }

  private resetColumns(): void {
    this.deptFGs.set([]);
    this.pwoList.set([]);
    this.swoList.set([]);
    this.allCIs.set([]);
    this.selectedFGId.set(null);
    this.selectedPWOId.set(null);
    this.selectedSWOId.set(null);
    this.selectedCapabilityId.set(null);
    this.checkedProficiencyIds.set([]);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    if (this.addDropdownOpen() && !target.closest('.add-split-btn')) {
      this.addDropdownOpen.set(false);
    }
    if (this.editDropdownOpen() && !target.closest('.add-split-btn')) {
      this.editDropdownOpen.set(false);
    }
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }
}
