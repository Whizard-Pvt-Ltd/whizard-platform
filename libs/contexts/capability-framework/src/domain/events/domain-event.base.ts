export interface DomainEvent {
  readonly aggregateId: string;
  readonly tenantId: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}
