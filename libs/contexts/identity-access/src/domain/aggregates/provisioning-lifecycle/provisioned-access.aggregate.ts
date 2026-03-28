import type { Invitation } from './entities/invitation.entity';
import type { ProvisioningEvent } from './entities/provisioning-event.entity';
import { DomainEvent } from '../../events/domain-event';

interface ProvisionedAccessState {
  id: string;
  userAccountId: string;
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  provisioningMode: 'MANUAL' | 'SSO' | 'SCIM' | 'BULK_IMPORT';
  lifecycleStatus: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEPROVISIONED';
  createdAt: Date;
  activatedAt: Date | null;
  deprovisionedAt: Date | null;
  invitations: Invitation[];
  events: ProvisioningEvent[];
}

export class ProvisionedAccess {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: ProvisionedAccessState) {}

  static provision(input: {
    id: string;
    userAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    provisioningMode: 'MANUAL' | 'SSO' | 'SCIM' | 'BULK_IMPORT';
    now?: Date;
  }): ProvisionedAccess {
    const now = input.now ?? new Date();

    const access = new ProvisionedAccess({
      id: input.id,
      userAccountId: input.userAccountId,
      tenantType: input.tenantType,
      tenantId: input.tenantId,
      provisioningMode: input.provisioningMode,
      lifecycleStatus: 'INVITED',
      createdAt: now,
      activatedAt: null,
      deprovisionedAt: null,
      invitations: [],
      events: []
    });

    access.raise({
      type: 'iam.access-provisioned.v1',
      occurredAt: now,
      payload: {
        provisionedAccessId: access.state.id,
        userAccountId: access.state.userAccountId,
        tenantType: access.state.tenantType,
        tenantId: access.state.tenantId
      }
    });

    return access;
  }

  invite(input: Invitation, now: Date = new Date()): void {
    this.state.invitations.push(input);

    this.raise({
      type: 'iam.access-invited.v1',
      occurredAt: now,
      payload: {
        provisionedAccessId: this.state.id,
        invitationId: input.invitationId,
        inviteeEmail: input.inviteeEmail
      }
    });
  }

  activate(now: Date = new Date()): void {
    this.state.lifecycleStatus = 'ACTIVE';
    this.state.activatedAt = now;

    this.raise({
      type: 'iam.access-activated.v1',
      occurredAt: now,
      payload: {
        provisionedAccessId: this.state.id
      }
    });
  }

  suspend(reason: string, now: Date = new Date()): void {
    this.state.lifecycleStatus = 'SUSPENDED';

    this.raise({
      type: 'iam.access-suspended.v1',
      occurredAt: now,
      payload: {
        provisionedAccessId: this.state.id,
        reason
      }
    });
  }

  deprovision(now: Date = new Date()): void {
    this.state.lifecycleStatus = 'DEPROVISIONED';
    this.state.deprovisionedAt = now;

    this.raise({
      type: 'iam.access-deprovisioned.v1',
      occurredAt: now,
      payload: {
        provisionedAccessId: this.state.id
      }
    });
  }

  recordProvisioningEvent(event: ProvisioningEvent): void {
    this.state.events.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const out = [...this.domainEvents];
    this.domainEvents.length = 0;
    return out;
  }

  private raise(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
