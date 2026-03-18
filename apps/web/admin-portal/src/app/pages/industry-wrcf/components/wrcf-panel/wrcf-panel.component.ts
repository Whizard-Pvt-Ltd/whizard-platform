import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PanelState, EntityType, FunctionalGroup, PrimaryWorkObject, SecondaryWorkObject
} from '../../models/wrcf.models';

@Component({
  selector: 'whizard-wrcf-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './wrcf-panel.component.html',
  styleUrl: './wrcf-panel.component.css',
})
export class WrcfPanelComponent implements OnChanges {
  @Input() state!: PanelState;
  @Output() save = new EventEmitter<Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  protected formName = '';
  protected formDescription = '';
  protected formStrategicImportance = 'Medium';
  protected formRevenueLink = 'No Impact';
  protected formDowntimeSensitivity = 'Low';
  protected formRiskWeight = '0.50';
  protected formDependencyLinks = '';

  protected readonly strategicOptions = ['Low', 'Medium', 'High', 'Critical'];
  protected readonly revenueLinkOptions = ['No Impact', 'Low Impact', 'High Impact'];
  protected readonly downtimeOptions = ['Low', 'Medium', 'High'];
  protected readonly riskWeightOptions = ['0.25', '0.50', '0.75', '1.00'];

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

    const base = { name: this.formName.trim(), description: this.formDescription.trim() };

    let payload: Partial<FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject>;

    if (this.state.entityType === 'SWO') {
      payload = {
        ...base,
        strategicImportance: this.formStrategicImportance,
        revenueLink: this.formRevenueLink,
        downtimeSensitivity: this.formDowntimeSensitivity,
        riskWeight: this.formRiskWeight,
        dependencyLinks: this.formDependencyLinks.trim(),
      } as Partial<SecondaryWorkObject>;
    } else {
      payload = base;
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

  private populateForm(): void {
    if (this.state.mode === 'edit' && this.state.data) {
      const d = this.state.data;
      this.formName = d.name;
      this.formDescription = d.description ?? '';

      if (this.state.entityType === 'SWO') {
        const swo = d as SecondaryWorkObject;
        this.formStrategicImportance = swo.strategicImportance ?? 'Medium';
        this.formRevenueLink = swo.revenueLink ?? 'No Impact';
        this.formDowntimeSensitivity = swo.downtimeSensitivity ?? 'Low';
        this.formRiskWeight = swo.riskWeight ?? '0.50';
        this.formDependencyLinks = swo.dependencyLinks ?? '';
      }
    } else {
      this.formName = '';
      this.formDescription = '';
      this.formStrategicImportance = 'Medium';
      this.formRevenueLink = 'No Impact';
      this.formDowntimeSensitivity = 'Low';
      this.formRiskWeight = '0.50';
      this.formDependencyLinks = '';
    }
  }
}
