import type { ActorLink } from './entities/actor-link.entity';
import type { Credential } from './entities/credential.entity';
import type { MfaEnrollment } from './entities/mfa-enrollment.entity';
import type { TenantMembership } from './entities/tenant-membership.entity';
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
  stackAuthUserId: string | null;
  createdAt: Date;
  activatedAt: Date | null;
  lastLoginAt: Date | null;
  credentials: Credential[];
  mfaEnrollments: MfaEnrollment[];
  tenantMemberships: TenantMembership[];
  actorLinks: ActorLink[];
}

export class UserAccount {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: UserAccountState) {}

  static registerLocal(input: {
    id: UserAccountId;
    email: EmailAddress;
    tenant: TenantRef;
    mfaRequired: boolean;
    stackAuthUserId?: string | null;
    now?: Date;
  }): UserAccount {
    const now = input.now ?? new Date();
    const account = new UserAccount({
      id: input.id,
      email: input.email,
      tenant: input.tenant,
      status: 'PENDING',
      mfaRequired: input.mfaRequired,
      stackAuthUserId: input.stackAuthUserId ?? null,
      createdAt: now,
      activatedAt: null,
      lastLoginAt: null,
      credentials: [],
      mfaEnrollments: [],
      tenantMemberships: [],
      actorLinks: []
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
    stackAuthUserId?: string | null;
    createdAt: Date;
    activatedAt: Date | null;
    lastLoginAt: Date | null;
    credentials?: Credential[];
    mfaEnrollments?: MfaEnrollment[];
    tenantMemberships?: TenantMembership[];
    actorLinks?: ActorLink[];
  }): UserAccount {
    return new UserAccount({
      id: UserAccountId.create(input.id),
      email: EmailAddress.create(input.email),
      tenant: TenantRef.create({ tenantType: input.tenantType, tenantId: input.tenantId }),
      status: input.status,
      mfaRequired: input.mfaRequired,
      stackAuthUserId: input.stackAuthUserId ?? null,
      createdAt: input.createdAt,
      activatedAt: input.activatedAt,
      lastLoginAt: input.lastLoginAt,
      credentials: input.credentials ?? [],
      mfaEnrollments: input.mfaEnrollments ?? [],
      tenantMemberships: input.tenantMemberships ?? [],
      actorLinks: input.actorLinks ?? []
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

  changeEmail(nextEmail: EmailAddress, now: Date = new Date()): void {
    if (this.state.email.value === nextEmail.value) {
      return;
    }

    const previousEmail = this.state.email.value;
    this.state.email = nextEmail;

    this.raise({
      type: 'iam.user-email-changed.v1',
      occurredAt: now,
      payload: {
        userAccountId: this.id.value,
        previousEmail,
        newEmail: nextEmail.value
      }
    });
  }

  enrollMfa(input: {
    enrollmentId: string;
    factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
    secretRef: string;
    now?: Date;
  }): void {
    const now = input.now ?? new Date();

    const existsActive = this.state.mfaEnrollments.some(
      (mfa) => mfa.factorType === input.factorType && mfa.status === 'ACTIVE'
    );

    if (existsActive) {
      return;
    }

    this.state.mfaEnrollments.push({
      enrollmentId: input.enrollmentId,
      factorType: input.factorType,
      secretRef: input.secretRef,
      status: 'ACTIVE',
      enrolledAt: now,
      revokedAt: null
    });

    this.raise({
      type: 'iam.mfa-enrolled.v1',
      occurredAt: now,
      payload: {
        userAccountId: this.id.value,
        enrollmentId: input.enrollmentId,
        factorType: input.factorType
      }
    });
  }

  revokeMfaFactor(enrollmentId: string, now: Date = new Date()): void {
    const enrollment = this.state.mfaEnrollments.find((item) => item.enrollmentId === enrollmentId);

    if (!enrollment || enrollment.status === 'REVOKED') {
      return;
    }

    enrollment.status = 'REVOKED';
    enrollment.revokedAt = now;

    this.raise({
      type: 'iam.mfa-factor-revoked.v1',
      occurredAt: now,
      payload: {
        userAccountId: this.id.value,
        enrollmentId
      }
    });
  }

  addTenantMembership(input: {
    membershipId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    now?: Date;
  }): void {
    const now = input.now ?? new Date();
    const exists = this.state.tenantMemberships.some(
      (membership) =>
        membership.tenantType === input.tenantType &&
        membership.tenantId === input.tenantId &&
        membership.status === 'ACTIVE'
    );

    if (exists) {
      return;
    }

    this.state.tenantMemberships.push({
      membershipId: input.membershipId,
      tenantType: input.tenantType,
      tenantId: input.tenantId,
      status: 'ACTIVE',
      joinedAt: now,
      revokedAt: null
    });

    this.raise({
      type: 'iam.tenant-membership-added.v1',
      occurredAt: now,
      payload: {
        userAccountId: this.id.value,
        membershipId: input.membershipId,
        tenantType: input.tenantType,
        tenantId: input.tenantId
      }
    });
  }

  linkActor(input: {
    actorLinkId: string;
    actorType: 'STUDENT' | 'COLLEGE_USER' | 'COMPANY_USER' | 'SYSTEM_USER';
    actorEntityId: string;
    isPrimary?: boolean;
    now?: Date;
  }): void {
    const now = input.now ?? new Date();

    if (input.isPrimary) {
      this.state.actorLinks = this.state.actorLinks.map((link) => ({ ...link, isPrimary: false }));
    }

    this.state.actorLinks.push({
      actorLinkId: input.actorLinkId,
      actorType: input.actorType,
      actorEntityId: input.actorEntityId,
      isPrimary: input.isPrimary ?? false,
      linkedAt: now
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
    stackAuthUserId: string | null;
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
      stackAuthUserId: this.state.stackAuthUserId,
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
