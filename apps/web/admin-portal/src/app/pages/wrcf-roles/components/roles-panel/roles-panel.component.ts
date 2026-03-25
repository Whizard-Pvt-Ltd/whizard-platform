import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { RolesPanelState, Department, IndustryRole } from '../../models/wrcf-roles.models';
import type { FunctionalGroup } from '../../../industry-wrcf/models/wrcf.models';

@Component({
  selector: 'whizard-roles-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './roles-panel.component.html',
  styleUrl: './roles-panel.component.css'
})
export class RolesPanelComponent implements OnChanges {
  @Input() state!: RolesPanelState;
  @Input() availableFGs: FunctionalGroup[] = [];
  @Output() save = new EventEmitter<Partial<Department | IndustryRole>>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  protected errorMsg = '';

  // Department fields
  protected deptName = '';
  protected deptFgIds: string[] = [];
  protected deptOperationalScore: number | null = null;
  protected deptRevenueWeight: number | null = null;
  protected deptRegulatoryLevel: number | null = null;

  // Role fields
  protected roleName = '';
  protected roleSeniorityLevel = 'Associate';
  protected roleReportingTo = '';
  protected roleCriticalityScore: number | null = null;

  protected readonly seniorityOptions = ['Intern', 'Trainee', 'Associate', 'Team Lead', 'Manager', 'Director'];

  protected get title(): string {
    const action = this.state.mode === 'create' ? 'Create' : 'Edit';
    return `${action} ${this.state.entity}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.errorMsg = '';
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.state.mode === 'edit' && this.state.data) {
      if (this.state.entity === 'Department') {
        const d = this.state.data as Department;
        this.deptName = d.name;
        this.deptFgIds = [...d.fgIds];
        this.deptOperationalScore = d.operationalCriticalityScore ?? null;
        this.deptRevenueWeight = d.revenueContributionWeight ?? null;
        this.deptRegulatoryLevel = d.regulatoryExposureLevel ?? null;
      } else {
        const d = this.state.data as IndustryRole;
        this.roleName = d.name;
        this.roleSeniorityLevel = d.seniorityLevel;
        this.roleReportingTo = d.reportingTo ?? '';
        this.roleCriticalityScore = d.roleCriticalityScore ?? null;
      }
    } else {
      this.deptName = '';
      this.deptFgIds = [];
      this.deptOperationalScore = null;
      this.deptRevenueWeight = null;
      this.deptRegulatoryLevel = null;
      this.roleName = '';
      this.roleSeniorityLevel = 'Associate';
      this.roleReportingTo = '';
      this.roleCriticalityScore = null;
    }
  }

  protected isFgChecked(fgId: string): boolean {
    return this.deptFgIds.includes(fgId);
  }

  protected toggleFg(fgId: string): void {
    if (this.deptFgIds.includes(fgId)) {
      this.deptFgIds = this.deptFgIds.filter(id => id !== fgId);
    } else {
      this.deptFgIds = [...this.deptFgIds, fgId];
    }
  }

  protected onSave(): void {
    this.errorMsg = '';

    if (this.state.entity === 'Department') {
      if (!this.deptName.trim()) {
        this.errorMsg = 'Name is required.';
        return;
      }
      const payload: Partial<Department> = {
        name: this.deptName.trim(),
        fgIds: [...this.deptFgIds],
        operationalCriticalityScore: this.deptOperationalScore ?? undefined,
        revenueContributionWeight: this.deptRevenueWeight ?? undefined,
        regulatoryExposureLevel: this.deptRegulatoryLevel ?? undefined
      };
      if (this.state.mode === 'edit' && this.state.data) {
        (payload as { id?: string }).id = this.state.data.id;
      }
      this.save.emit(payload);
    } else {
      if (!this.roleName.trim() || !this.roleSeniorityLevel) {
        this.errorMsg = 'Name and Seniority Level are required.';
        return;
      }
      const payload: Partial<IndustryRole> = {
        name: this.roleName.trim(),
        seniorityLevel: this.roleSeniorityLevel,
        reportingTo: this.roleReportingTo.trim() || undefined,
        roleCriticalityScore: this.roleCriticalityScore ?? undefined
      };
      if (this.state.mode === 'edit' && this.state.data) {
        (payload as { id?: string }).id = this.state.data.id;
      }
      this.save.emit(payload);
    }
  }

  protected onDelete(): void {
    if (this.state.data) {
      this.delete.emit(this.state.data.id);
    }
  }
}
