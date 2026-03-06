import type {
  AccessPrincipal as AccessPrincipalRow,
  PermissionGrant,
  RoleAssignment,
  ScopeRestriction
} from '@prisma/client';
import { AccessPrincipal } from '../../../../domain/aggregates/access-policy/access-principal.aggregate';

export const toAccessPrincipalDomain = (input: {
  principal: AccessPrincipalRow;
  roles: RoleAssignment[];
  permissions: PermissionGrant[];
  restrictions: ScopeRestriction[];
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
