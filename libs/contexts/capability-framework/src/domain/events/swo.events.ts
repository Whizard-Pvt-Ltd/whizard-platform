import type { DomainEvent } from './domain-event.base';

export class SwoCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class SwoUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class SwoDeactivatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}
