import type { IamEventEnvelope } from '../../contracts/events/iam-event-envelope';
import type { DomainEvent } from '../../domain';

const inferAggregateType = (eventType: string): string => {
  if (eventType.includes('session')) {
    return 'user-session';
  }

  if (eventType.includes('access')) {
    return 'access-policy';
  }

  return 'user-account';
};

const inferAggregateId = (payload: Record<string, unknown>): string => {
  const id = payload.userAccountId ?? payload.sessionId ?? payload.accessPrincipalId;

  if (!id || typeof id !== 'string') {
    return 'unknown';
  }

  return id;
};

export const mapDomainEventsToEnvelopes = (events: DomainEvent[]): IamEventEnvelope[] => {
  return events.map((event) => {
    const payload = event.payload as Record<string, unknown>;

    return {
      eventType: event.type,
      aggregateType: inferAggregateType(event.type),
      aggregateId: inferAggregateId(payload),
      occurredAt: event.occurredAt.toISOString(),
      payload
    };
  });
};
