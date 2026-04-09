import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  ImpactLevelOption, CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS
} from '../../models/wrcf-impact-levels';
import {
  PanelState, EntityType, FunctionalGroup, PrimaryWorkObject, SecondaryWorkObject,
  DomainType, StrategicImportance
} from '../../models/wrcf.models';

const DOMAIN_TYPE_OPTIONS: DomainType[] = (['Operations', 'Maintenance', 'Quality'] as DomainType[]).sort();

@Component({
  selector: 'whizard-wrcf-panel',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './wrcf-panel.component.html',
  styleUrl: './wrcf-panel.component.css',
})
export class WrcfPanelComponent implements OnChanges {
  @Input() state!: PanelState;
  @Input() panelError = '';
  @Output() save = new EventEmitter<Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>>();
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  protected formName = '';
  protected formDescription = '';
  protected confirmingDelete = false;

  // FG fields
  protected formDomainType: DomainType = DOMAIN_TYPE_OPTIONS[0];

  // PWO fields
  protected formStrategicImportance: StrategicImportance = 3;
  protected formRevenueImpact: ImpactLevelOption = CRITICALITY_LEVELS[1];
  protected formDowntimeSensitivity: ImpactLevelOption = CRITICALITY_LEVELS[1];

  // SWO fields
  protected formOperationalComplexity: ImpactLevelOption = COMPLEXITY_LEVELS[1];
  protected formAssetCriticality: ImpactLevelOption = CRITICALITY_LEVELS[1];
  protected formFailureFrequency: ImpactLevelOption = FREQUENCY_LEVELS[0];

  protected readonly domainTypeOptions: DomainType[] = DOMAIN_TYPE_OPTIONS;
  protected readonly strategicImportanceOptions: StrategicImportance[] = [1, 2, 3, 4, 5];
  protected readonly criticalityLevelOptions = CRITICALITY_LEVELS;
  protected readonly complexityLevelOptions = COMPLEXITY_LEVELS;
  protected readonly frequencyLevelOptions = FREQUENCY_LEVELS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.populateForm();
    }
  }

  protected get title(): string {
    return `${this.state.mode === 'create' ? 'Create' : 'Edit'} ${this.entityLabel(this.state.entityType)}`;
  }

  protected entityLabel(type: EntityType): string {
    const labels: Record<EntityType, string> = { FG: 'Functional Group', PWO: 'Primary Work Obj.', SWO: 'SWO' };
    return labels[type];
  }

  protected onSave(): void {
    if (!this.formName.trim()) return;
    if (this.formName.trim().length > 50) return;

    const base = { name: this.formName.trim(), description: this.formDescription.trim() };
    let payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>;

    if (this.state.entityType === 'FG') {
      payload = { ...base, domainType: this.formDomainType } as Partial<FunctionalGroup>;
    } else if (this.state.entityType === 'PWO') {
      payload = {
        ...base,
        strategicImportance: this.formStrategicImportance,
        revenueImpact: this.formRevenueImpact,
        downtimeSensitivity: this.formDowntimeSensitivity
      } as Partial<PrimaryWorkObject>;
    } else {
      payload = {
        ...base,
        operationalComplexity: this.formOperationalComplexity,
        assetCriticality: this.formAssetCriticality,
        failureFrequency: this.formFailureFrequency
      } as Partial<SecondaryWorkObject>;
    }

    if (this.state.mode === 'edit' && this.state.data) {
      (payload as { id?: string }).id = this.state.data.id;
    }

    this.save.emit(payload);
  }

  protected onDelete(): void {
    this.deleteRequested.emit();
  }

  public showDeleteConfirmation(): void {
    this.confirmingDelete = true;
  }

  protected onConfirmDelete(): void {
    if (this.state.data) {
      this.delete.emit(this.state.data.id);
    }
    this.confirmingDelete = false;
  }

  protected onCancelDelete(): void {
    this.confirmingDelete = false;
  }

  private populateForm(): void {
    if (this.state.mode === 'edit' && this.state.data) {
      const d = this.state.data;
      this.formName = d.name;
      this.formDescription = d.description ?? '';

      if (this.state.entityType === 'FG') {
        const fg = d as FunctionalGroup;
        this.formDomainType = fg.domainType ?? 'Operations';
      } else if (this.state.entityType === 'PWO') {
        const pwo = d as PrimaryWorkObject;
        this.formStrategicImportance = pwo.strategicImportance ?? 3;
        this.formRevenueImpact = CRITICALITY_LEVELS.find(o => o.label === pwo.revenueImpact?.label) ?? CRITICALITY_LEVELS[1];
        this.formDowntimeSensitivity = CRITICALITY_LEVELS.find(o => o.label === pwo.downtimeSensitivity?.label) ?? CRITICALITY_LEVELS[1];
      } else {
        const swo = d as SecondaryWorkObject;
        this.formOperationalComplexity = COMPLEXITY_LEVELS.find(o => o.label === swo.operationalComplexity?.label) ?? COMPLEXITY_LEVELS[1];
        this.formAssetCriticality = CRITICALITY_LEVELS.find(o => o.label === swo.assetCriticality?.label) ?? CRITICALITY_LEVELS[1];
        this.formFailureFrequency = FREQUENCY_LEVELS.find(o => o.label === swo.failureFrequency?.label) ?? FREQUENCY_LEVELS[0];
      }
    } else {
      this.formName = '';
      this.formDescription = '';
      this.formDomainType = DOMAIN_TYPE_OPTIONS[0];
      this.confirmingDelete = false;
      this.formStrategicImportance = 3;
      this.formRevenueImpact = CRITICALITY_LEVELS[1];
      this.formDowntimeSensitivity = CRITICALITY_LEVELS[1];
      this.formOperationalComplexity = COMPLEXITY_LEVELS[1];
      this.formAssetCriticality = CRITICALITY_LEVELS[1];
      this.formFailureFrequency = FREQUENCY_LEVELS[0];
    }
  }
}
