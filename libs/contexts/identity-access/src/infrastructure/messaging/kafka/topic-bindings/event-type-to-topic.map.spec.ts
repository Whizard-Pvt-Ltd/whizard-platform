import { describe, expect, it } from 'vitest';
import { getIamTopicForEventType } from './event-type-to-topic.map';

describe('getIamTopicForEventType', () => {
  it('routes user identity event to user-account topic', () => {
    expect(getIamTopicForEventType('iam.user-account-created.v1')).toBe(
      'iam.user-account-events.v1'
    );
  });

  it('routes access-policy event to access topic', () => {
    expect(getIamTopicForEventType('iam.role-assigned.v1')).toBe('iam.access-events.v1');
  });

  it('routes provisioning event to provisioning topic', () => {
    expect(getIamTopicForEventType('iam.access-provisioned.v1')).toBe(
      'iam.provisioning-events.v1'
    );
  });
});
