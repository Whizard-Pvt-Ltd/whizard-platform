import { DomainEvent } from '../../events/domain-event';
import { IamDomainError } from '../../exceptions/iam-domain.error';
import { EmailAddress } from '../../value-objects/email-address.vo';
import { TenantRef } from '../../value-objects/tenant-ref.vo';
import { UserAccountId } from '../../value-objects/user-account-id.vo';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

interface UserAccountState {
  id: UserAccountId;
  email: EmailAddress;
  tenant: TenantRef;
  status: AccountStatus;
  mfaRequired: boolean;
  createdAt: Date;
  activatedAt: Date | null;
  lastLoginAt: Date | null;
}

export class UserAccount {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: UserAccountState) {}

  static registerLocal(input: {
    id: UserAccountId;
    email: EmailAddress;
    tenant: TenantRef;
    mfaRequired: boolean;
    now?: Date;
  }): UserAccount {
    const now = input.now ?? new Date();
    const account = new UserAccount({
      id: input.id,
      email: input.email,
      tenant: input.tenant,
      status: 'PENDING',
      mfaRequired: input.mfaRequired,
      createdAt: now,
      activatedAt: null,
      lastLoginAt: null
    });

    account.raise({
      type: 'iam.user-account-created.v1',
      occurredAt: now,
      payload: {
        userAccountId: account.id.value,
        email: account.email.value,
        tenantType: account.tenant.tenantType,
        tenantId: account.tenant.tenantId,
        mfaRequired: account.mfaRequired
      }
    });

    return account;
  }

  static rehydrate(input: {
    id: string;
    email: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    status: AccountStatus;
    mfaRequired: boolean;
    createdAt: Date;
    activatedAt: Date | null;
    lastLoginAt: Date | null;
  }): UserAccount {
    return new UserAccount({
      id: UserAccountId.create(input.id),
      email: EmailAddress.create(input.email),
      tenant: TenantRef.create({ tenantType: input.tenantType, tenantId: input.tenantId }),
      status: input.status,
      mfaRequired: input.mfaRequired,
      createdAt: input.createdAt,
      activatedAt: input.activatedAt,
      lastLoginAt: input.lastLoginAt
    });
  }

  activate(now: Date = new Date()): void {
    if (this.state.status !== 'PENDING') {
      throw new IamDomainError('Only pending accounts can be activated.');
    }

    this.state.status = 'ACTIVE';
    this.state.activatedAt = now;

    this.raise({
      type: 'iam.user-account-activated.v1',
      occurredAt: now,
      payload: { userAccountId: this.id.value }
    });
  }

  markLogin(now: Date = new Date()): void {
    this.state.lastLoginAt = now;
  }

  pullDomainEvents(): DomainEvent[] {
    const out = [...this.domainEvents];
    this.domainEvents.length = 0;
    return out;
  }

  toPrimitives(): {
    id: string;
    email: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    status: AccountStatus;
    mfaRequired: boolean;
    createdAt: Date;
    activatedAt: Date | null;
    lastLoginAt: Date | null;
  } {
    return {
      id: this.id.value,
      email: this.email.value,
      tenantType: this.tenant.tenantType,
      tenantId: this.tenant.tenantId,
      status: this.state.status,
      mfaRequired: this.state.mfaRequired,
      createdAt: this.state.createdAt,
      activatedAt: this.state.activatedAt,
      lastLoginAt: this.state.lastLoginAt
    };
  }

  get id(): UserAccountId {
    return this.state.id;
  }

  get email(): EmailAddress {
    return this.state.email;
  }

  get tenant(): TenantRef {
    return this.state.tenant;
  }

  get status(): AccountStatus {
    return this.state.status;
  }

  get mfaRequired(): boolean {
    return this.state.mfaRequired;
  }

  private raise(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
