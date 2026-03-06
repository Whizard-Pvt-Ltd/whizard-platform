import { describe, expect, it } from 'vitest';
import { RegisterLocalUserHandler } from '../../application/command-handlers/register-local-user.handler';
import type { OutboxPort } from '../../application/ports/event-bus/outbox.port';
import type { UserAccountRepository } from '../../application/ports/repositories/user-account.repository';
import type { IamEventEnvelope } from '../../contracts/events/iam-event-envelope';
import { UserAccount } from '../../domain';

class InMemoryUserAccountRepository implements UserAccountRepository {
  private readonly byEmail = new Map<string, UserAccount>();
  private readonly byId = new Map<string, UserAccount>();

  async findByEmail(email: string): Promise<UserAccount | null> {
    return this.byEmail.get(email) ?? null;
  }

  async findById(id: string): Promise<UserAccount | null> {
    return this.byId.get(id) ?? null;
  }

  async save(userAccount: UserAccount): Promise<void> {
    this.byEmail.set(userAccount.email.value, userAccount);
    this.byId.set(userAccount.id.value, userAccount);
  }
}

class InMemoryOutbox implements OutboxPort {
  events: IamEventEnvelope[] = [];

  async append(events: IamEventEnvelope[]): Promise<void> {
    this.events.push(...events);
  }
}

describe('RegisterLocalUserHandler', () => {
  it('creates new account and appends outbox event', async () => {
    const repo = new InMemoryUserAccountRepository();
    const outbox = new InMemoryOutbox();
    const handler = new RegisterLocalUserHandler(repo, outbox);

    const result = await handler.execute({
      email: 'new.user@whizard.io',
      tenantType: 'COMPANY',
      tenantId: 'company-1',
      mfaRequired: true
    });

    expect(result.userAccountId).toBeTruthy();
    expect(outbox.events[0].eventType).toBe('iam.user-account-created.v1');
  });
});
