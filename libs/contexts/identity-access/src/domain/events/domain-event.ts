export interface DomainEvent<TPayload = Record<string, unknown>> {
  type: string;
  occurredAt: Date;
  payload: TPayload;
}
