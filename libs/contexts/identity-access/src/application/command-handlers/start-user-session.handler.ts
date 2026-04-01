import type { StartUserSessionCommand } from '../commands/start-user-session.command';
import type { StartUserSessionResponse } from '../dto/start-user-session.response';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { UserAccountRepository } from '../ports/repositories/user-account.repository';
import type { UserSessionRepository } from '../ports/repositories/user-session.repository';
import { SessionId, UserSession, type UserAccount } from '../../domain';
import { mapDomainEventsToEnvelopes } from '../mappers/domain-event-to-envelope.mapper';
import {
  defaultSessionPolicy,
  type SessionPolicy
} from '../policies/session-policy';

const ensureAccountCanStartSession = (userAccount: UserAccount): void => {
  if (userAccount.status !== 'ACTIVE') {
    throw new Error('User account is not active.');
  }
};

export class StartUserSessionHandler {
  constructor(
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly outbox: OutboxPort,
    private readonly policy: SessionPolicy = defaultSessionPolicy
  ) {}

  async execute(command: StartUserSessionCommand): Promise<StartUserSessionResponse> {
    const userAccount = await this.userAccountRepository.findById(command.userAccountId);

    if (!userAccount) {
      throw new Error('User account not found.');
    }

    ensureAccountCanStartSession(userAccount);

    const activeSessions = await this.userSessionRepository.findActiveByUserAccountId(
      command.userAccountId
    );

    if (activeSessions.length >= this.policy.maxConcurrentSessions) {
      throw new Error('Concurrent session limit exceeded.');
    }

    const session = UserSession.start({
      id: SessionId.create(),
      userAccountId: userAccount.id,
      clientContext: command.clientContext,
      ttlMinutes: this.policy.sessionTtlMinutes,
      refreshTtlMinutes: this.policy.refreshTtlMinutes
    });

    await this.userSessionRepository.save(session);
    await this.outbox.append(mapDomainEventsToEnvelopes(session.pullDomainEvents()));

    return {
      sessionId: session.id.value,
      expiresAt: session.expiresAt.toISOString()
    };
  }
}
