export interface IamIntegrationEventV1<TPayload = Record<string, unknown>> {
  schemaVersion: 'v1';
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  occurredAt: string;
  producedAt: string;
  source: 'identity-access';
  payload: TPayload;
}
