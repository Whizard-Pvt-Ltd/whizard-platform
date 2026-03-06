import { describe, expect, it } from 'vitest';
import { EmailAddress, TenantRef, UserAccount, UserAccountId } from '../../domain';

describe('UserAccount aggregate', () => {
  it('registers local user with pending status and emits account-created event', () => {
    const aggregate = UserAccount.registerLocal({
      id: UserAccountId.create('user-1'),
      email: EmailAddress.create('Admin@Whizard.io'),
      tenant: TenantRef.create({ tenantType: 'COLLEGE', tenantId: 'college-1' }),
      mfaRequired: true,
      now: new Date('2026-03-06T10:00:00.000Z')
    });

    expect(aggregate.status).toBe('PENDING');
    expect(aggregate.email.value).toBe('admin@whizard.io');

    const events = aggregate.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('iam.user-account-created.v1');
  });
});
