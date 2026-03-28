import { randomUUID } from 'crypto';
import type { DomainEvent } from '../events/domain-event.base';
import type { ImpactLevelValue } from '../value-objects/impact-level.vo';
import type { StrategicImportance } from '../value-objects/strategic-importance.vo';
import { PwoCreatedEvent, PwoUpdatedEvent, PwoDeactivatedEvent } from '../events/pwo.events';

export interface PrimaryWorkObjectProps {
  id: string;
  tenantId: string;
  versionId?: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
  isActive: boolean;
}

export interface CreatePrimaryWorkObjectProps {
  tenantId: string;
  versionId?: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
}

export class PrimaryWorkObject {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  versionId?: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
  isActive: boolean;

  private constructor(props: PrimaryWorkObjectProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.versionId = props.versionId;
    this.functionalGroupId = props.functionalGroupId;
    this.name = props.name;
    this.description = props.description;
    this.strategicImportance = props.strategicImportance;
    this.revenueImpact = props.revenueImpact;
    this.downtimeSensitivity = props.downtimeSensitivity;
    this.isActive = props.isActive;
  }

  static create(props: CreatePrimaryWorkObjectProps): PrimaryWorkObject {
    const pwo = new PrimaryWorkObject({ ...props, id: randomUUID(), isActive: true });
    pwo._domainEvents.push(
      new PwoCreatedEvent(pwo.id, pwo.tenantId, {
        functionalGroupId: pwo.functionalGroupId,
        name: pwo.name
      })
    );
    return pwo;
  }

  static reconstitute(props: PrimaryWorkObjectProps): PrimaryWorkObject {
    return new PrimaryWorkObject(props);
  }

  update(props: Partial<Pick<PrimaryWorkObjectProps, 'name' | 'description' | 'strategicImportance' | 'revenueImpact' | 'downtimeSensitivity'>>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description;
    if (props.strategicImportance !== undefined) this.strategicImportance = props.strategicImportance;
    if (props.revenueImpact !== undefined) this.revenueImpact = props.revenueImpact;
    if (props.downtimeSensitivity !== undefined) this.downtimeSensitivity = props.downtimeSensitivity;
    this._domainEvents.push(new PwoUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  deactivate(): void {
    this.isActive = false;
    this._domainEvents.push(new PwoDeactivatedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
