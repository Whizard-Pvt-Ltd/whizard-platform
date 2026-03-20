import type { DomainEvent } from './domain-event.base';

export class CapabilityInstanceCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class CapabilityInstanceDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}
