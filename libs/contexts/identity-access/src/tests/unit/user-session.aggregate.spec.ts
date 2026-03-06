import { describe, expect, it } from 'vitest';
import { SessionId, UserAccountId, UserSession } from '../../domain';

describe('UserSession aggregate', () => {
  it('starts session and emits session-started event', () => {
    const session = UserSession.start({
      id: SessionId.create('session-1'),
      userAccountId: UserAccountId.create('user-1'),
      clientContext: 'web-admin',
      ttlMinutes: 30,
      refreshTtlMinutes: 60,
      now: new Date('2026-03-06T10:00:00.000Z')
    });

    expect(session.status).toBe('ACTIVE');
    expect(session.pullDomainEvents()[0].type).toBe('iam.session-started.v1');
  });
});
