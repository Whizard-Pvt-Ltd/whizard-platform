import type { DomainEvent } from '../events/domain-event.base';
import type { DomainType } from '../value-objects/domain-type.vo';
import {
  FunctionalGroupCreatedEvent,
  FunctionalGroupUpdatedEvent,
  FunctionalGroupDeactivatedEvent
} from '../events/functional-group.events';

export interface FunctionalGroupProps {
  id: string;
  tenantId: string;
  versionId?: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateFunctionalGroupProps {
  tenantId: string;
  versionId?: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
  createdBy?: string;
}

export class FunctionalGroup {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  versionId?: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;

  private constructor(props: FunctionalGroupProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.versionId = props.versionId;
    this.industryId = props.industryId;
    this.name = props.name;
    this.description = props.description;
    this.domainType = props.domainType;
    this.isActive = props.isActive;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  static create(props: CreateFunctionalGroupProps): FunctionalGroup {
    const fg = new FunctionalGroup({ ...props, id: '0', isActive: true, updatedBy: props.createdBy });
    fg._domainEvents.push(
      new FunctionalGroupCreatedEvent(fg.id, fg.tenantId, {
        industryId: fg.industryId,
        name: fg.name,
        domainType: fg.domainType
      })
    );
    return fg;
  }

  static reconstitute(props: FunctionalGroupProps): FunctionalGroup {
    return new FunctionalGroup(props);
  }

  update(props: Partial<Pick<FunctionalGroupProps, 'name' | 'description' | 'domainType' | 'updatedBy'>>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.description !== undefined) this.description = props.description;
    if (props.domainType !== undefined) this.domainType = props.domainType;
    if (props.updatedBy !== undefined) this.updatedBy = props.updatedBy;
    this._domainEvents.push(
      new FunctionalGroupUpdatedEvent(this.id, this.tenantId, { name: this.name })
    );
  }

  deactivate(): void {
    this.isActive = false;
    this._domainEvents.push(
      new FunctionalGroupDeactivatedEvent(this.id, this.tenantId, {})
    );
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
