import { DomainEvent } from '../../events/domain-event';
import { IamDomainError } from '../../exceptions/iam-domain.error';
import { SessionId } from '../../value-objects/session-id.vo';
import { UserAccountId } from '../../value-objects/user-account-id.vo';

export type SessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

interface UserSessionState {
  id: SessionId;
  userAccountId: UserAccountId;
  status: SessionStatus;
  issuedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  refreshExpiresAt: Date;
  clientContext: string;
}

export class UserSession {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: UserSessionState) {}

  static start(input: {
    id: SessionId;
    userAccountId: UserAccountId;
    clientContext: string;
    ttlMinutes: number;
    refreshTtlMinutes: number;
    now?: Date;
  }): UserSession {
    const now = input.now ?? new Date();
    const session = new UserSession({
      id: input.id,
      userAccountId: input.userAccountId,
      status: 'ACTIVE',
      issuedAt: now,
      lastActivityAt: now,
      expiresAt: new Date(now.getTime() + input.ttlMinutes * 60_000),
      refreshExpiresAt: new Date(now.getTime() + input.refreshTtlMinutes * 60_000),
      clientContext: input.clientContext
    });

    session.raise({
      type: 'iam.session-started.v1',
      occurredAt: now,
      payload: {
        sessionId: session.id.value,
        userAccountId: session.userAccountId.value,
        expiresAt: session.expiresAt.toISOString()
      }
    });

    return session;
  }

  static rehydrate(input: {
    id: string;
    userAccountId: string;
    status: SessionStatus;
    issuedAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    refreshExpiresAt: Date;
    clientContext: string;
  }): UserSession {
    return new UserSession({
      id: SessionId.create(input.id),
      userAccountId: UserAccountId.create(input.userAccountId),
      status: input.status,
      issuedAt: input.issuedAt,
      lastActivityAt: input.lastActivityAt,
      expiresAt: input.expiresAt,
      refreshExpiresAt: input.refreshExpiresAt,
      clientContext: input.clientContext
    });
  }

  refresh(now: Date = new Date()): void {
    if (this.state.status !== 'ACTIVE') {
      throw new IamDomainError('Only active sessions can be refreshed.');
    }

    if (now > this.state.refreshExpiresAt) {
      throw new IamDomainError('Refresh window expired.');
    }

    this.state.lastActivityAt = now;

    this.raise({
      type: 'iam.session-refreshed.v1',
      occurredAt: now,
      payload: {
        sessionId: this.id.value,
        userAccountId: this.userAccountId.value,
        refreshExpiresAt: this.refreshExpiresAt.toISOString()
      }
    });
  }

  revoke(reason: string, now: Date = new Date()): void {
    if (this.state.status !== 'ACTIVE') {
      return;
    }

    this.state.status = 'REVOKED';

    this.raise({
      type: 'iam.session-revoked.v1',
      occurredAt: now,
      payload: {
        sessionId: this.id.value,
        userAccountId: this.userAccountId.value,
        reason
      }
    });
  }

  markExpired(now: Date = new Date()): void {
    if (this.state.status !== 'ACTIVE' || now < this.state.expiresAt) {
      return;
    }

    this.state.status = 'EXPIRED';

    this.raise({
      type: 'iam.session-expired.v1',
      occurredAt: now,
      payload: {
        sessionId: this.id.value,
        userAccountId: this.userAccountId.value
      }
    });
  }

  pullDomainEvents(): DomainEvent[] {
    const out = [...this.domainEvents];
    this.domainEvents.length = 0;
    return out;
  }

  toPrimitives(): {
    id: string;
    userAccountId: string;
    status: SessionStatus;
    issuedAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    refreshExpiresAt: Date;
    clientContext: string;
  } {
    return {
      id: this.id.value,
      userAccountId: this.userAccountId.value,
      status: this.state.status,
      issuedAt: this.state.issuedAt,
      lastActivityAt: this.state.lastActivityAt,
      expiresAt: this.state.expiresAt,
      refreshExpiresAt: this.state.refreshExpiresAt,
      clientContext: this.state.clientContext
    };
  }

  get id(): SessionId {
    return this.state.id;
  }

  get userAccountId(): UserAccountId {
    return this.state.userAccountId;
  }

  get status(): SessionStatus {
    return this.state.status;
  }

  get expiresAt(): Date {
    return this.state.expiresAt;
  }

  get refreshExpiresAt(): Date {
    return this.state.refreshExpiresAt;
  }

  private raise(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
