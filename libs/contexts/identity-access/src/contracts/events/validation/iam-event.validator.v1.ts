import type { IamEventEnvelope } from '../iam-event-envelope';
import type { IamEventTypeV1 } from '../iam-event-payload-map.v1';

const hasString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export const isKnownIamEventTypeV1 = (eventType: string): eventType is IamEventTypeV1 => {
  return eventType.endsWith('.v1') && eventType.startsWith('iam.');
};

export const validateIamEventEnvelopeV1 = (event: IamEventEnvelope): void => {
  if (!isKnownIamEventTypeV1(event.eventType)) {
    throw new Error(`Unsupported IAM event type: ${event.eventType}`);
  }

  if (!hasString(event.aggregateType)) {
    throw new Error('Invalid aggregateType in IAM event envelope.');
  }

  if (!hasString(event.aggregateId)) {
    throw new Error('Invalid aggregateId in IAM event envelope.');
  }

  if (!hasString(event.occurredAt)) {
    throw new Error('Invalid occurredAt in IAM event envelope.');
  }

  if (typeof event.payload !== 'object' || event.payload === null) {
    throw new Error('Invalid payload in IAM event envelope.');
  }
};
