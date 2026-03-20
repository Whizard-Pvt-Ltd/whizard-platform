import type { DomainEvent } from './domain-event.base';

export class FunctionalGroupCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class FunctionalGroupUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class FunctionalGroupDeactivatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}
