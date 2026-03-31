import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SkillsPanelState, SkillItem, TaskItem, ControlPointItem } from '../../models/wrcf-skills.models';
import type { ProficiencyLevel } from '../../../industry-wrcf/models/wrcf.models';

@Component({
  selector: 'whizard-skills-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './skills-panel.component.html',
  styleUrl: './skills-panel.component.css'
})
export class SkillsPanelComponent implements OnChanges {
  @Input() state!: SkillsPanelState;
  @Input() proficiencyLevels: ProficiencyLevel[] = [];
  @Output() save = new EventEmitter<Partial<SkillItem | TaskItem | ControlPointItem>>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  protected errorMsg = '';

  // Skill fields
  protected skillName = '';
  protected skillCognitiveType = 'Procedural';
  protected skillCriticality = 'Medium';
  protected skillRecertificationCycleMonths = 6;
  protected skillAiImpact = 'Medium';

  // Task fields
  protected taskName = '';
  protected taskDescription = '';
  protected taskFrequency = 'Daily';
  protected taskComplexity = 'Medium';
  protected taskStandardDuration: number | null = null;
  protected taskRequiredProficiencyId = '';

  // ControlPoint fields
  protected cpName = '';
  protected cpDescription = '';
  protected cpRiskLevel = 'Medium';
  protected cpFailureImpactType = 'Safety';
  protected cpKpiThreshold: number | null = null;
  protected cpEscalationRequired = false;

  protected readonly cognitiveTypeOptions = ['Procedural', 'Decision', 'Diagnostic'];
  protected readonly criticalityOptions = ['Low', 'Medium', 'High'];
  protected readonly aiImpactOptions = ['Low', 'Medium', 'High'];
  protected readonly frequencyOptions = ['Daily', 'Weekly', 'Rare'];
  protected readonly complexityOptions = ['Low', 'Medium', 'High'];
  protected readonly riskLevelOptions = ['Low', 'Medium', 'High', 'Critical'];
  protected readonly failureImpactTypeOptions = ['Safety', 'Compliance', 'Financial'];

  protected get title(): string {
    const action = this.state.mode === 'create' ? 'Create New' : 'Edit';
    const labels: Record<string, string> = { Skill: 'Skill', Task: 'Task', ControlPoint: 'Control Point' };
    return `${action} ${labels[this.state.entity]}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.errorMsg = '';
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.state.mode === 'edit' && this.state.data) {
      if (this.state.entity === 'Skill') {
        const d = this.state.data as SkillItem;
        this.skillName = d.name;
        this.skillCognitiveType = d.cognitiveType;
        this.skillCriticality = d.skillCriticality;
        this.skillRecertificationCycleMonths = d.recertificationCycleMonths;
        this.skillAiImpact = d.aiImpact;
      } else if (this.state.entity === 'Task') {
        const d = this.state.data as TaskItem;
        this.taskName = d.name;
        this.taskDescription = d.description ?? '';
        this.taskFrequency = d.frequency;
        this.taskComplexity = d.complexity;
        this.taskStandardDuration = d.standardDuration;
        const matchedProf = this.proficiencyLevels.find(p => p.level === d.requiredProficiencyLevel);
        this.taskRequiredProficiencyId = matchedProf?.id ?? '';
      } else {
        const d = this.state.data as ControlPointItem;
        this.cpName = d.name;
        this.cpDescription = d.description ?? '';
        this.cpRiskLevel = d.riskLevel;
        this.cpFailureImpactType = d.failureImpactType;
        this.cpKpiThreshold = d.kpiThreshold ?? null;
        this.cpEscalationRequired = d.escalationRequired;
      }
    } else {
      this.skillName = '';
      this.skillCognitiveType = 'Procedural';
      this.skillCriticality = 'Medium';
      this.skillRecertificationCycleMonths = 6;
      this.skillAiImpact = 'Medium';
      this.taskName = '';
      this.taskDescription = '';
      this.taskFrequency = 'Daily';
      this.taskComplexity = 'Medium';
      this.taskStandardDuration = null;
      this.taskRequiredProficiencyId = '';
      this.cpName = '';
      this.cpDescription = '';
      this.cpRiskLevel = 'Medium';
      this.cpFailureImpactType = 'Safety';
      this.cpKpiThreshold = null;
      this.cpEscalationRequired = false;
    }
  }

  protected onSave(): void {
    this.errorMsg = '';
    let payload: Partial<SkillItem | TaskItem | ControlPointItem> = {};

    if (this.state.entity === 'Skill') {
      if (!this.skillName.trim() || !this.skillCognitiveType || !this.skillCriticality || !this.skillAiImpact) {
        this.errorMsg = 'Name, Cognitive Type, Skill Criticality and AI Impact are required.';
        return;
      }
      if (this.skillRecertificationCycleMonths < 1 || this.skillRecertificationCycleMonths > 12) {
        this.errorMsg = 'Recertification Cycle must be between 1 and 12 months.';
        return;
      }
      const p: Partial<SkillItem> = {
        name: this.skillName.trim(),
        cognitiveType: this.skillCognitiveType,
        skillCriticality: this.skillCriticality,
        recertificationCycleMonths: this.skillRecertificationCycleMonths,
        aiImpact: this.skillAiImpact
      };
      payload = p;
    } else if (this.state.entity === 'Task') {
      if (!this.taskName.trim() || !this.taskDescription.trim() || !this.taskFrequency || !this.taskComplexity || !this.taskStandardDuration) {
        this.errorMsg = 'Name, Description, Frequency, Complexity and Standard Duration are required.';
        return;
      }
      const matched = this.taskRequiredProficiencyId
        ? this.proficiencyLevels.find(p => p.id === this.taskRequiredProficiencyId)
        : undefined;
      const p: Partial<TaskItem> = {
        name: this.taskName.trim(),
        description: this.taskDescription.trim(),
        frequency: this.taskFrequency,
        complexity: this.taskComplexity,
        standardDuration: this.taskStandardDuration,
        requiredProficiencyLevel: matched?.level ?? 'L1'
      };
      payload = p;
    } else {
      if (!this.cpName.trim() || !this.cpRiskLevel || !this.cpFailureImpactType) {
        this.errorMsg = 'Name, Risk Level and Failure Impact Type are required.';
        return;
      }
      const p: Partial<ControlPointItem> = {
        name: this.cpName.trim(),
        description: this.cpDescription.trim() || undefined,
        riskLevel: this.cpRiskLevel,
        failureImpactType: this.cpFailureImpactType,
        kpiThreshold: this.cpKpiThreshold ?? undefined,
        escalationRequired: this.cpEscalationRequired
      };
      payload = p;
    }

    if (this.state.mode === 'edit' && this.state.data) {
      (payload as { id?: string }).id = this.state.data.id;
    }

    this.save.emit(payload);
  }

  protected onDelete(): void {
    if (this.state.data) {
      this.delete.emit(this.state.data.id);
    }
  }
}
