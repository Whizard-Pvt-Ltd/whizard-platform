import { randomUUID } from 'node:crypto';
import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';
import type { IamIntegrationEventV1 } from '../../../../contracts/events/iam-integration-event.v1';

export interface SerializedKafkaMessage {
  readonly key: string;
  readonly value: string;
  readonly headers: Readonly<Record<string, string>>;
}

export const toIntegrationEventV1 = (
  envelope: IamEventEnvelope,
  now: Date = new Date()
): IamIntegrationEventV1 => {
  return {
    schemaVersion: 'v1',
    eventId: randomUUID(),
    eventType: envelope.eventType,
    aggregateType: envelope.aggregateType,
    aggregateId: envelope.aggregateId,
    occurredAt: envelope.occurredAt,
    producedAt: now.toISOString(),
    source: 'identity-access',
    payload: envelope.payload ?? {}
  };
};

export const serializeIntegrationEventV1 = (
  event: IamIntegrationEventV1
): SerializedKafkaMessage => {
  return {
    key: event.aggregateId,
    value: JSON.stringify(event),
    headers: {
      'x-event-id': event.eventId,
      'x-event-type': event.eventType,
      'x-schema-version': event.schemaVersion,
      'x-source': event.source,
      'content-type': 'application/json'
    }
  };
};

export const deserializeIntegrationEventV1 = (rawValue: string): IamIntegrationEventV1 => {
  const parsed = JSON.parse(rawValue) as Partial<IamIntegrationEventV1>;

  if (parsed.schemaVersion !== 'v1' || typeof parsed.eventType !== 'string') {
    throw new Error('Invalid IAM integration event payload.');
  }

  return parsed as IamIntegrationEventV1;
};
