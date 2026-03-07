export interface DomainEvent<TPayload = Record<string, unknown>> {
  readonly type: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}

export interface DomainEventEnvelope<TPayload = Record<string, unknown>> {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly event: DomainEvent<TPayload>;
}

export const createDomainEvent = <TPayload>(input: {
  type: string;
  payload: TPayload;
  occurredAt?: Date;
}): DomainEvent<TPayload> => {
  return {
    type: input.type,
    payload: input.payload,
    occurredAt: input.occurredAt ?? new Date()
  };
};
