import { AccessPrincipal } from '../../../../domain/aggregates/access-policy/access-principal.aggregate';

interface AccessPrincipalRow {
  id: string;
  userAccountId: string;
  tenantType: string;
  tenantId: string;
  status: string;
  createdAt: Date;
  version: number;
}

interface RoleAssignmentRow {
  id: string;
  roleCode: string;
  assignedBy: string;
  assignedAt: Date;
  validFrom: Date | null;
  validTo: Date | null;
  status: string;
}

interface PermissionGrantRow {
  id: string;
  permissionCode: string;
  grantSource: string;
  scopeType: string | null;
  scopeValue: string | null;
  grantedAt: Date;
  revokedAt: Date | null;
}

interface ScopeRestrictionRow {
  id: string;
  resourceType: string;
  restrictionType: string;
  scopeExpression: string;
  createdAt: Date;
}

export const toAccessPrincipalDomain = (input: {
  principal: AccessPrincipalRow;
  roles: RoleAssignmentRow[];
  permissions: PermissionGrantRow[];
  restrictions: ScopeRestrictionRow[];
}): AccessPrincipal => {
  return AccessPrincipal.rehydrate({
    id: input.principal.id,
    userAccountId: input.principal.userAccountId,
    tenantType: input.principal.tenantType as 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY',
    tenantId: input.principal.tenantId,
    status: input.principal.status as 'ACTIVE' | 'SUSPENDED',
    createdAt: input.principal.createdAt,
    version: input.principal.version,
    roles: input.roles.map((role) => ({
      id: role.id,
      roleCode: role.roleCode,
      assignedBy: role.assignedBy,
      assignedAt: role.assignedAt,
      validFrom: role.validFrom,
      validTo: role.validTo,
      status: role.status as 'ACTIVE' | 'REVOKED'
    })),
    permissions: input.permissions.map((grant) => ({
      id: grant.id,
      permissionCode: grant.permissionCode,
      grantSource: grant.grantSource,
      scopeType: grant.scopeType,
      scopeValue: grant.scopeValue,
      grantedAt: grant.grantedAt,
      revokedAt: grant.revokedAt
    })),
    restrictions: input.restrictions.map((restriction) => ({
      id: restriction.id,
      resourceType: restriction.resourceType,
      restrictionType: restriction.restrictionType,
      scopeExpression: restriction.scopeExpression,
      createdAt: restriction.createdAt
    }))
  });
};
