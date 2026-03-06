export interface IamEventEnvelope<TPayload = Record<string, unknown>> {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  occurredAt: string;
  payload: TPayload;
}
