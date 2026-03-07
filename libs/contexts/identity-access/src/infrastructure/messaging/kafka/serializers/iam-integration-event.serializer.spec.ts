import { describe, expect, it } from 'vitest';
import {
  deserializeIntegrationEventV1,
  serializeIntegrationEventV1,
  toIntegrationEventV1
} from './iam-integration-event.serializer';

describe('iam integration event serializer', () => {
  it('builds and serializes a v1 integration event envelope', () => {
    const event = toIntegrationEventV1({
      eventType: 'iam.user-account-created.v1',
      aggregateType: 'UserAccount',
      aggregateId: 'u-1',
      occurredAt: '2026-03-07T00:00:00.000Z',
      payload: { email: 'a@example.com' }
    });

    const message = serializeIntegrationEventV1(event);
    const roundTrip = deserializeIntegrationEventV1(message.value);

    expect(roundTrip.schemaVersion).toBe('v1');
    expect(roundTrip.eventType).toBe('iam.user-account-created.v1');
    expect(roundTrip.aggregateId).toBe('u-1');
  });
});
