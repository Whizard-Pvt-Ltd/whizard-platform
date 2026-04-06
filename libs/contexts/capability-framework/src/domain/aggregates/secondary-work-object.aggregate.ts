import type { DomainEvent } from '../events/domain-event.base';
import type { ImpactLevelValue } from '../value-objects/impact-level.vo';
import { SwoCreatedEvent, SwoUpdatedEvent, SwoDeactivatedEvent } from '../events/swo.events';

export interface SecondaryWorkObjectProps {
  id: string;
  tenantId: string;
  versionId?: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSecondaryWorkObjectProps {
  tenantId: string;
  versionId?: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
  createdBy?: string;
}

export class SecondaryWorkObject {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  versionId?: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;

  private constructor(props: SecondaryWorkObjectProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.versionId = props.versionId;
    this.pwoId = props.pwoId;
    this.name = props.name;
    this.description = props.description;
    this.operationalComplexity = props.operationalComplexity;
    this.assetCriticality = props.assetCriticality;
    this.failureFrequency = props.failureFrequency;
    this.isActive = props.isActive;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  static create(props: CreateSecondaryWorkObjectProps): SecondaryWorkObject {
    const swo = new SecondaryWorkObject({ ...props, id: '0', isActive: true });
    swo._domainEvents.push(
      new SwoCreatedEvent(swo.id, swo.tenantId, { pwoId: swo.pwoId, name: swo.name })
    );
    return swo;
  }

  static reconstitute(props: SecondaryWorkObjectProps): SecondaryWorkObject {
    return new SecondaryWorkObject(props);
  }

  update(props: Partial<Pick<SecondaryWorkObjectProps, 'name' | 'description' | 'operationalComplexity' | 'assetCriticality' | 'failureFrequency' | 'updatedBy'>>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description;
    if (props.operationalComplexity !== undefined) this.operationalComplexity = props.operationalComplexity;
    if (props.assetCriticality !== undefined) this.assetCriticality = props.assetCriticality;
    if (props.failureFrequency !== undefined) this.failureFrequency = props.failureFrequency;
    if (props.updatedBy !== undefined) this.updatedBy = props.updatedBy;
    this._domainEvents.push(new SwoUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  deactivate(): void {
    this.isActive = false;
    this._domainEvents.push(new SwoDeactivatedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
