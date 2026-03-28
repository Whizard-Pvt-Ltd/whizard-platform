import { DomainEvent } from '../../events/domain-event';
import { IamDomainError } from '../../exceptions/iam-domain.error';
import { AccessDecision } from '../../value-objects/access-decision';
import { TenantRef } from '../../value-objects/tenant-ref.vo';
import { UserAccountId } from '../../value-objects/user-account-id.vo';

export type AccessPrincipalStatus = 'ACTIVE' | 'SUSPENDED';

export interface RoleAssignmentState {
  id: string;
  roleCode: string;
  assignedBy: string;
  assignedAt: Date;
  validFrom: Date | null;
  validTo: Date | null;
  status: 'ACTIVE' | 'REVOKED';
}

export interface PermissionGrantState {
  id: string;
  permissionCode: string;
  grantSource: string;
  scopeType: string | null;
  scopeValue: string | null;
  grantedAt: Date;
  revokedAt: Date | null;
}

export interface ScopeRestrictionState {
  id: string;
  resourceType: string;
  restrictionType: string;
  scopeExpression: string;
  createdAt: Date;
}

interface AccessPrincipalState {
  id: string;
  userAccountId: UserAccountId;
  tenant: TenantRef;
  status: AccessPrincipalStatus;
  createdAt: Date;
  version: number;
  roles: RoleAssignmentState[];
  permissions: PermissionGrantState[];
  restrictions: ScopeRestrictionState[];
}

export class AccessPrincipal {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: AccessPrincipalState) {}

  static create(input: {
    id: string;
    userAccountId: UserAccountId;
    tenant: TenantRef;
    now?: Date;
  }): AccessPrincipal {
    const now = input.now ?? new Date();
    const principal = new AccessPrincipal({
      id: input.id,
      userAccountId: input.userAccountId,
      tenant: input.tenant,
      status: 'ACTIVE',
      createdAt: now,
      version: 1,
      roles: [],
      permissions: [],
      restrictions: []
    });

    principal.raise({
      type: 'iam.access-principal-created.v1',
      occurredAt: now,
      payload: {
        accessPrincipalId: principal.id,
        userAccountId: principal.userAccountId.value,
        tenantType: principal.tenant.tenantType,
        tenantId: principal.tenant.tenantId
      }
    });

    return principal;
  }

  static rehydrate(input: {
    id: string;
    userAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    status: AccessPrincipalStatus;
    createdAt: Date;
    version: number;
    roles: RoleAssignmentState[];
    permissions: PermissionGrantState[];
    restrictions: ScopeRestrictionState[];
  }): AccessPrincipal {
    return new AccessPrincipal({
      id: input.id,
      userAccountId: UserAccountId.create(input.userAccountId),
      tenant: TenantRef.create({ tenantType: input.tenantType, tenantId: input.tenantId }),
      status: input.status,
      createdAt: input.createdAt,
      version: input.version,
      roles: input.roles,
      permissions: input.permissions,
      restrictions: input.restrictions
    });
  }

  evaluateAccess(input: {
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    permissionCode: string;
    resourceType?: string;
    resourceId?: string;
  }): AccessDecision {
    const sameTenant =
      this.tenant.tenantType === input.tenantType && this.tenant.tenantId === input.tenantId;

    if (!sameTenant || this.state.status !== 'ACTIVE') {
      return AccessDecision.deny();
    }

    const hasPermission = this.state.permissions.some(
      (grant) => grant.permissionCode === input.permissionCode && !grant.revokedAt
    );

    if (!hasPermission) {
      return AccessDecision.deny();
    }

    if (!input.resourceType || !input.resourceId) {
      return AccessDecision.allow();
    }

    const hasBlockingRestriction = this.state.restrictions.some((restriction) => {
      if (restriction.resourceType !== input.resourceType) {
        return false;
      }

      if (restriction.restrictionType !== 'ALLOW_LIST') {
        return false;
      }

      const allowList = restriction.scopeExpression.split(',').map((value) => value.trim());
      return !allowList.includes(input.resourceId!);
    });

    return hasBlockingRestriction ? AccessDecision.deny() : AccessDecision.allow();
  }

  assignRole(input: {
    roleId: string;
    roleCode: string;
    assignedBy: string;
    assignedAt?: Date;
    validFrom?: Date | null;
    validTo?: Date | null;
  }): void {
    if (this.state.status !== 'ACTIVE') {
      throw new IamDomainError('Cannot assign roles to inactive principal.');
    }

    const alreadyActive = this.state.roles.some(
      (role) => role.roleCode === input.roleCode && role.status === 'ACTIVE'
    );

    if (alreadyActive) {
      return;
    }

    const assignedAt = input.assignedAt ?? new Date();

    this.state.roles.push({
      id: input.roleId,
      roleCode: input.roleCode,
      assignedBy: input.assignedBy,
      assignedAt,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
      status: 'ACTIVE'
    });

    this.raise({
      type: 'iam.role-assigned.v1',
      occurredAt: assignedAt,
      payload: {
        accessPrincipalId: this.id,
        roleCode: input.roleCode
      }
    });
  }

  revokeRole(input: { roleCode: string; revokedAt?: Date }): void {
    const revokedAt = input.revokedAt ?? new Date();
    const role = this.state.roles.find(
      (item) => item.roleCode === input.roleCode && item.status === 'ACTIVE'
    );

    if (!role) {
      return;
    }

    role.status = 'REVOKED';
    role.validTo = revokedAt;

    this.raise({
      type: 'iam.role-revoked.v1',
      occurredAt: revokedAt,
      payload: {
        accessPrincipalId: this.id,
        roleCode: input.roleCode
      }
    });
  }

  grantPermission(input: {
    grantId: string;
    permissionCode: string;
    grantSource: string;
    scopeType?: string;
    scopeValue?: string;
    grantedAt?: Date;
  }): void {
    const grantedAt = input.grantedAt ?? new Date();

    this.state.permissions.push({
      id: input.grantId,
      permissionCode: input.permissionCode,
      grantSource: input.grantSource,
      scopeType: input.scopeType ?? null,
      scopeValue: input.scopeValue ?? null,
      grantedAt,
      revokedAt: null
    });

    this.raise({
      type: 'iam.permission-granted.v1',
      occurredAt: grantedAt,
      payload: {
        accessPrincipalId: this.id,
        permissionCode: input.permissionCode
      }
    });
  }

  addScopeRestriction(input: {
    restrictionId: string;
    resourceType: string;
    restrictionType: string;
    scopeExpression: string;
    createdAt?: Date;
  }): void {
    const createdAt = input.createdAt ?? new Date();

    this.state.restrictions.push({
      id: input.restrictionId,
      resourceType: input.resourceType,
      restrictionType: input.restrictionType,
      scopeExpression: input.scopeExpression,
      createdAt
    });

    this.raise({
      type: 'iam.scope-restriction-added.v1',
      occurredAt: createdAt,
      payload: {
        accessPrincipalId: this.id,
        resourceType: input.resourceType,
        restrictionType: input.restrictionType
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
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    status: AccessPrincipalStatus;
    createdAt: Date;
    version: number;
    roles: RoleAssignmentState[];
    permissions: PermissionGrantState[];
    restrictions: ScopeRestrictionState[];
  } {
    return {
      id: this.id,
      userAccountId: this.userAccountId.value,
      tenantType: this.tenant.tenantType,
      tenantId: this.tenant.tenantId,
      status: this.state.status,
      createdAt: this.state.createdAt,
      version: this.state.version,
      roles: [...this.state.roles],
      permissions: [...this.state.permissions],
      restrictions: [...this.state.restrictions]
    };
  }

  get id(): string {
    return this.state.id;
  }

  get userAccountId(): UserAccountId {
    return this.state.userAccountId;
  }

  get tenant(): TenantRef {
    return this.state.tenant;
  }

  private raise(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
