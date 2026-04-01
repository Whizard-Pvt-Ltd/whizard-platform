import type { DomainEvent } from '../events/domain-event.base';
import { CapabilityInstanceCreatedEvent, CapabilityInstanceDeletedEvent } from '../events/capability-instance.events';

export interface CapabilityInstanceProps {
  id: string;
  tenantId: string;
  functionalGroupId: string;
  pwoId?: string;
  swoId?: string;
  capabilityId: string;
  proficiencyId: string;
}

export class CapabilityInstance {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly functionalGroupId: string;
  readonly pwoId?: string;
  readonly swoId?: string;
  readonly capabilityId: string;
  readonly proficiencyId: string;

  private constructor(props: CapabilityInstanceProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.functionalGroupId = props.functionalGroupId;
    this.pwoId = props.pwoId;
    this.swoId = props.swoId;
    this.capabilityId = props.capabilityId;
    this.proficiencyId = props.proficiencyId;
  }

  static create(props: Omit<CapabilityInstanceProps, 'id'>): CapabilityInstance {
    const ci = new CapabilityInstance({ ...props, id: '0' });
    ci._domainEvents.push(
      new CapabilityInstanceCreatedEvent(ci.id, ci.tenantId, {
        functionalGroupId: ci.functionalGroupId,
        pwoId: ci.pwoId,
        swoId: ci.swoId,
        capabilityId: ci.capabilityId,
        proficiencyId: ci.proficiencyId
      })
    );
    return ci;
  }

  static reconstitute(props: CapabilityInstanceProps): CapabilityInstance {
    return new CapabilityInstance(props);
  }

  delete(): void {
    this._domainEvents.push(
      new CapabilityInstanceDeletedEvent(this.id, this.tenantId, {})
    );
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
