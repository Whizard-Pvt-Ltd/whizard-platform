import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { FunctionalGroup, PrimaryWorkObject, SecondaryWorkObject, Capability, ProficiencyLevel, WrcfEntity, CapabilityInstance } from '../industry-wrcf/models/wrcf.models';
import type { SkillItem, TaskItem, ControlPointItem, SkillsPanelState } from './models/wrcf-skills.models';
import { WrcfColumnComponent } from '../industry-wrcf/components/wrcf-column/wrcf-column.component';
import { WrcfApiService } from '../industry-wrcf/services/wrcf-api.service';
import { SkillsPanelComponent } from './components/skills-panel/skills-panel.component';
import { WrcfSkillsApiService } from './services/wrcf-skills-api.service';

@Component({
  selector: 'whizard-wrcf-skills',
  standalone: true,
  imports: [FormsModule, RouterLink, WrcfColumnComponent, SkillsPanelComponent, ScrollbarDirective],
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
  templateUrl: './wrcf-skills.component.html',
  styleUrl: './wrcf-skills.component.css'
})
export class WrcfSkillsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly wrcfApi = inject(WrcfApiService);
  private readonly skillsApi = inject(WrcfSkillsApiService);
  private industryId = '';
  private pendingSelection: {
    fgId: string;
    pwoId: string;
    swoId: string;
    capabilityId: string;
    proficiencyId: string;
  } | null = null;

  protected fgList = signal<FunctionalGroup[]>([]);
  protected pwoList = signal<PrimaryWorkObject[]>([]);
  protected swoList = signal<SecondaryWorkObject[]>([]);
  protected allCIs = signal<CapabilityInstance[]>([]);

  private allCapabilities: Capability[] = [];
  private allProficiencies: ProficiencyLevel[] = [];

  protected get allProficienciesPublic(): ProficiencyLevel[] {
    return this.allProficiencies;
  }

  protected selectedFGId = signal('');
  protected selectedPWOId = signal('');
  protected selectedSWOId = signal('');
  protected selectedCapabilityId = signal('');
  protected selectedProficiencyId = signal('');
  protected resolvedCiId = signal<string | null>(null);

  protected skills = signal<SkillItem[]>([]);
  protected selectedSkill = signal<SkillItem | null>(null);
  protected tasks = signal<TaskItem[]>([]);
  protected selectedTask = signal<TaskItem | null>(null);
  protected controlPoints = signal<ControlPointItem[]>([]);

  protected panel = signal<SkillsPanelState>({ open: false, mode: 'create', entity: 'Skill' });
  protected errorMessage = signal('');
  protected toastMessage = signal('');
  protected noIndustry = signal(false);

  protected get availableCapabilities(): Capability[] {
    const swoId = this.selectedSWOId();
    if (!swoId) return [];
    const ciCapIds = new Set(
      this.allCIs().filter(ci => ci.swoId === swoId).map(ci => ci.capabilityId)
    );
    return this.allCapabilities.filter(c => ciCapIds.has(c.id));
  }

  protected get availableProficiencies(): ProficiencyLevel[] {
    const swoId = this.selectedSWOId();
    const capId = this.selectedCapabilityId();
    if (!swoId || !capId) return [];
    const ciProfIds = new Set(
      this.allCIs().filter(ci => ci.swoId === swoId && ci.capabilityId === capId).map(ci => ci.proficiencyId)
    );
    return this.allProficiencies.filter(p => ciProfIds.has(p.id));
  }

  ngOnInit(): void {
    this.wrcfApi.listCapabilities().subscribe({
      next: c => { this.allCapabilities = c; },
      error: () => {}
    });
    this.wrcfApi.listProficiencies().subscribe({
      next: p => { this.allProficiencies = p; },
      error: () => {}
    });

    this.route.queryParams.subscribe(params => {
      const ciId = params['capabilityInstanceId'];
      const industryId = params['industryId'];
      const fgId = params['fgId'] ?? '';
      const pwoId = params['pwoId'] ?? '';
      const swoId = params['swoId'] ?? '';
      const capabilityId = params['capabilityId'] ?? '';
      const proficiencyId = params['proficiencyId'] ?? '';

      if (ciId) {
        this.resolvedCiId.set(ciId);
        this.loadSkills(ciId);
      }

      if (industryId) {
        this.noIndustry.set(false);
        this.industryId = industryId;
        this.pendingSelection = { fgId, pwoId, swoId, capabilityId, proficiencyId };
        this.wrcfApi.listCIs(industryId).subscribe({
          next: cis => {
            this.allCIs.set(cis);
            this.fgList.set(this.deriveFGsFromCIs(cis));
            this.restoreSelectionFromQuery();
          },
          error: () => { this.allCIs.set([]); this.fgList.set([]); }
        });
      } else {
        this.noIndustry.set(true);
      }
    });
  }

  private deriveFGsFromCIs(cis: CapabilityInstance[]): FunctionalGroup[] {
    const seen = new Map<string, FunctionalGroup>();
    for (const ci of cis) {
      if (!seen.has(ci.functionalGroupId)) {
        seen.set(ci.functionalGroupId, {
          id: ci.functionalGroupId,
          name: ci.fgName ?? ci.functionalGroupId,
          industryId: this.industryId,
          domainType: 'Operations'
        });
      }
    }
    return Array.from(seen.values());
  }

  private derivePWOsFromCIs(cis: CapabilityInstance[], fgId: string): PrimaryWorkObject[] {
    const seen = new Map<string, PrimaryWorkObject>();
    for (const ci of cis.filter(c => c.functionalGroupId === fgId && c.pwoId)) {
      if (!seen.has(ci.pwoId!)) {
        seen.set(ci.pwoId!, {
          id: ci.pwoId!,
          name: ci.pwoName ?? ci.pwoId!,
          functionalGroupId: fgId,
          strategicImportance: 1,
          revenueImpact: { label: '', value: 0 },
          downtimeSensitivity: { label: '', value: 0 }
        });
      }
    }
    return Array.from(seen.values());
  }

  private deriveSWOsFromCIs(cis: CapabilityInstance[], pwoId: string): SecondaryWorkObject[] {
    const seen = new Map<string, SecondaryWorkObject>();
    for (const ci of cis.filter(c => c.pwoId === pwoId && c.swoId)) {
      if (!seen.has(ci.swoId!)) {
        seen.set(ci.swoId!, {
          id: ci.swoId!,
          name: ci.swoName ?? ci.swoId!,
          pwoId,
          operationalComplexity: { label: '', value: 0 },
          assetCriticality: { label: '', value: 0 },
          failureFrequency: { label: '', value: 0 }
        });
      }
    }
    return Array.from(seen.values());
  }

  protected onFGChange(fgId: string): void {
    this.selectedFGId.set(fgId);
    this.selectedPWOId.set('');
    this.selectedSWOId.set('');
    this.selectedCapabilityId.set('');
    this.selectedProficiencyId.set('');
    this.swoList.set([]);
    this.resolvedCiId.set(null);
    this.clearSkillsDown();
    if (fgId) {
      this.pwoList.set(this.derivePWOsFromCIs(this.allCIs(), fgId));
      this.restoreSelectionFromQuery();
    } else {
      this.pwoList.set([]);
    }
  }

  protected onPWOChange(pwoId: string): void {
    this.selectedPWOId.set(pwoId);
    this.selectedSWOId.set('');
    this.selectedCapabilityId.set('');
    this.selectedProficiencyId.set('');
    this.resolvedCiId.set(null);
    this.clearSkillsDown();
    if (pwoId) {
      this.swoList.set(this.deriveSWOsFromCIs(this.allCIs(), pwoId));
      this.restoreSelectionFromQuery();
    } else {
      this.swoList.set([]);
    }
  }

  protected onSWOChange(swoId: string): void {
    this.selectedSWOId.set(swoId);
    this.selectedCapabilityId.set('');
    this.selectedProficiencyId.set('');
    this.resolvedCiId.set(null);
    this.clearSkillsDown();
  }

  protected onCapabilityChange(capabilityId: string): void {
    this.selectedCapabilityId.set(capabilityId);
    this.selectedProficiencyId.set('');
    this.resolvedCiId.set(null);
    this.clearSkillsDown();
    this.restoreSelectionFromQuery();
  }

  protected onProficiencyChange(proficiencyId: string): void {
    this.selectedProficiencyId.set(proficiencyId);
    this.tryResolveCi();
    this.restoreSelectionFromQuery();
  }

  private restoreSelectionFromQuery(): void {
    const selection = this.pendingSelection;
    if (!selection) return;

    if (selection.fgId && !this.selectedFGId()) {
      const hasFg = this.fgList().some(fg => fg.id === selection.fgId);
      if (hasFg) {
        this.onFGChange(selection.fgId);
        return;
      }
    }

    if (selection.pwoId && this.selectedFGId() && !this.selectedPWOId() && this.pwoList().length > 0) {
      const hasPwo = this.pwoList().some(pwo => pwo.id === selection.pwoId);
      if (hasPwo) {
        this.onPWOChange(selection.pwoId);
        return;
      }
    }

    if (selection.swoId && this.selectedPWOId() && !this.selectedSWOId() && this.swoList().length > 0) {
      const hasSwo = this.swoList().some(swo => swo.id === selection.swoId);
      if (hasSwo) {
        this.onSWOChange(selection.swoId);
        return;
      }
    }

    if (selection.capabilityId && this.selectedSWOId() && !this.selectedCapabilityId() && this.allCIs().length > 0) {
      const hasCapability = this.availableCapabilities.some(capability => capability.id === selection.capabilityId);
      if (hasCapability) {
        this.onCapabilityChange(selection.capabilityId);
        return;
      }
    }

    if (selection.proficiencyId && this.selectedCapabilityId() && !this.selectedProficiencyId()) {
      const hasProficiency = this.availableProficiencies.some(
        proficiency => proficiency.id === selection.proficiencyId
      );
      if (hasProficiency) {
        this.onProficiencyChange(selection.proficiencyId);
      }
    }

    const restoredAllRequestedSelections =
      (!selection.fgId || this.selectedFGId() === selection.fgId) &&
      (!selection.pwoId || this.selectedPWOId() === selection.pwoId) &&
      (!selection.swoId || this.selectedSWOId() === selection.swoId) &&
      (!selection.capabilityId || this.selectedCapabilityId() === selection.capabilityId) &&
      (!selection.proficiencyId || this.selectedProficiencyId() === selection.proficiencyId);

    if (restoredAllRequestedSelections) {
      this.pendingSelection = null;
    }
  }

  private tryResolveCi(): void {
    const swoId = this.selectedSWOId();
    const capabilityId = this.selectedCapabilityId();
    const proficiencyId = this.selectedProficiencyId();
    if (!swoId || !capabilityId || !proficiencyId) {
      this.resolvedCiId.set(null);
      this.clearSkillsDown();
      return;
    }
    const match = this.allCIs().find(ci =>
      ci.swoId === swoId &&
      ci.capabilityId === capabilityId &&
      ci.proficiencyId === proficiencyId
    );
    if (match) {
      this.resolvedCiId.set(match.id);
      this.loadSkills(match.id);
    } else {
      this.resolvedCiId.set(null);
      this.clearSkillsDown();
    }
  }

  private loadSkills(ciId: string): void {
    this.skillsApi.listSkills(ciId).subscribe({
      next: skills => this.skills.set(skills),
      error: () => this.skills.set([])
    });
    this.selectedSkill.set(null);
    this.tasks.set([]);
    this.selectedTask.set(null);
    this.controlPoints.set([]);
  }

  private clearSkillsDown(): void {
    this.skills.set([]);
    this.selectedSkill.set(null);
    this.tasks.set([]);
    this.selectedTask.set(null);
    this.controlPoints.set([]);
  }

  protected onSkillSelect(item: WrcfEntity): void {
    const skill = this.skills().find(s => s.id === item.id) ?? null;
    this.selectedSkill.set(skill);
    this.selectedTask.set(null);
    this.controlPoints.set([]);
    if (skill) {
      this.skillsApi.listTasks(skill.id).subscribe({
        next: tasks => this.tasks.set(tasks),
        error: () => this.tasks.set([])
      });
    } else {
      this.tasks.set([]);
    }
  }

  protected onTaskSelect(item: WrcfEntity): void {
    const task = this.tasks().find(t => t.id === item.id) ?? null;
    this.selectedTask.set(task);
    if (task) {
      this.skillsApi.listControlPoints(task.id).subscribe({
        next: cps => this.controlPoints.set(cps),
        error: () => this.controlPoints.set([])
      });
    } else {
      this.controlPoints.set([]);
    }
  }

  protected onControlPointSelect(_item: WrcfEntity): void {}

  protected openSkillPanel(mode: 'create' | 'edit', data?: SkillItem): void {
    this.panel.set({ open: true, mode, entity: 'Skill', data });
  }

  protected openTaskPanel(mode: 'create' | 'edit', data?: TaskItem): void {
    this.panel.set({ open: true, mode, entity: 'Task', data });
  }

  protected openControlPointPanel(mode: 'create' | 'edit', data?: ControlPointItem): void {
    this.panel.set({ open: true, mode, entity: 'ControlPoint', data });
  }

  protected closePanel(): void {
    this.panel.set({ ...this.panel(), open: false });
  }

  protected onPanelSave(payload: Partial<SkillItem | TaskItem | ControlPointItem>): void {
    const { entity, mode } = this.panel();

    if (entity === 'Skill') {
      const ciId = this.resolvedCiId();
      if (!ciId) return;
      if (mode === 'create') {
        this.skillsApi.createSkill({ ...(payload as Omit<SkillItem, 'id'>), capabilityInstanceId: ciId }).subscribe({
          next: () => { this.loadSkills(ciId); this.closePanel(); },
          error: () => this.showError('Failed to create skill.')
        });
      } else {
        const id = (payload as { id?: string }).id!;
        this.skillsApi.updateSkill(id, payload as Partial<Omit<SkillItem, 'id' | 'capabilityInstanceId'>>).subscribe({
          next: () => { this.loadSkills(ciId); this.closePanel(); },
          error: () => this.showError('Failed to update skill.')
        });
      }
    } else if (entity === 'Task') {
      const skill = this.selectedSkill();
      if (!skill) return;
      if (mode === 'create') {
        this.skillsApi.createTask({ ...(payload as Omit<TaskItem, 'id'>), skillId: skill.id }).subscribe({
          next: () => {
            this.skillsApi.listTasks(skill.id).subscribe({ next: tasks => this.tasks.set(tasks) });
            this.closePanel();
          },
          error: () => this.showError('Failed to create task.')
        });
      } else {
        const id = (payload as { id?: string }).id!;
        this.skillsApi.updateTask(id, payload as Partial<Omit<TaskItem, 'id' | 'skillId'>>).subscribe({
          next: () => {
            this.skillsApi.listTasks(skill.id).subscribe({ next: tasks => this.tasks.set(tasks) });
            this.closePanel();
          },
          error: () => this.showError('Failed to update task.')
        });
      }
    } else {
      const task = this.selectedTask();
      if (!task) return;
      if (mode === 'create') {
        this.skillsApi.createControlPoint({ ...(payload as Omit<ControlPointItem, 'id'>), taskId: task.id }).subscribe({
          next: () => {
            this.skillsApi.listControlPoints(task.id).subscribe({ next: cps => this.controlPoints.set(cps) });
            this.closePanel();
          },
          error: () => this.showError('Failed to create control point.')
        });
      } else {
        const id = (payload as { id?: string }).id!;
        this.skillsApi.updateControlPoint(id, payload as Partial<Omit<ControlPointItem, 'id' | 'taskId'>>).subscribe({
          next: () => {
            this.skillsApi.listControlPoints(task.id).subscribe({ next: cps => this.controlPoints.set(cps) });
            this.closePanel();
          },
          error: () => this.showError('Failed to update control point.')
        });
      }
    }
  }

  protected onPanelDelete(id: string): void {
    const { entity } = this.panel();
    const ciId = this.resolvedCiId();

    if (entity === 'Skill') {
      this.skillsApi.deleteSkill(id).subscribe({
        next: () => {
          if (ciId) this.loadSkills(ciId);
          this.closePanel();
        },
        error: () => this.showError('Failed to delete skill.')
      });
    } else if (entity === 'Task') {
      const skill = this.selectedSkill();
      this.skillsApi.deleteTask(id).subscribe({
        next: () => {
          if (skill) this.skillsApi.listTasks(skill.id).subscribe({ next: tasks => this.tasks.set(tasks) });
          this.selectedTask.set(null);
          this.controlPoints.set([]);
          this.closePanel();
        },
        error: () => this.showError('Failed to delete task.')
      });
    } else {
      const task = this.selectedTask();
      this.skillsApi.deleteControlPoint(id).subscribe({
        next: () => {
          if (task) this.skillsApi.listControlPoints(task.id).subscribe({ next: cps => this.controlPoints.set(cps) });
          this.closePanel();
        },
        error: () => this.showError('Failed to delete control point.')
      });
    }
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }

  protected get skillsAsEntities(): WrcfEntity[] {
    return this.skills().map(s => ({ id: s.id, name: s.name, canEdit: s.canEdit }));
  }

  protected get tasksAsEntities(): WrcfEntity[] {
    return this.tasks().map(t => ({ id: t.id, name: t.name, canEdit: t.canEdit }));
  }

  protected get controlPointsAsEntities(): WrcfEntity[] {
    return this.controlPoints().map(cp => ({ id: cp.id, name: cp.name, canEdit: cp.canEdit }));
  }

  protected onSkillEditClicked(item: WrcfEntity): void {
    const skill = this.skills().find(s => s.id === item.id);
    if (skill) this.openSkillPanel('edit', skill);
  }

  protected onTaskEditClicked(item: WrcfEntity): void {
    const task = this.tasks().find(t => t.id === item.id);
    if (task) this.openTaskPanel('edit', task);
  }

  protected onControlPointEditClicked(item: WrcfEntity): void {
    const cp = this.controlPoints().find(c => c.id === item.id);
    if (cp) this.openControlPointPanel('edit', cp);
  }
}
