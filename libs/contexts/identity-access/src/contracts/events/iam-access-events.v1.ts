import type { TenantType } from '../api';

export interface IamAccessPrincipalCreatedPayloadV1 {
  accessPrincipalId: string;
  userAccountId: string;
  tenantType: TenantType;
  tenantId: string;
}

export interface IamRoleAssignedPayloadV1 {
  accessPrincipalId: string;
  roleCode: string;
}

export interface IamRoleRevokedPayloadV1 {
  accessPrincipalId: string;
  roleCode: string;
}

export interface IamPermissionGrantedPayloadV1 {
  accessPrincipalId: string;
  permissionCode: string;
}

export interface IamPermissionRevokedPayloadV1 {
  accessPrincipalId: string;
  permissionCode: string;
}

export interface IamScopeRestrictionAddedPayloadV1 {
  accessPrincipalId: string;
  resourceType: string;
  scopeExpression: string;
}

export interface IamScopeRestrictionRemovedPayloadV1 {
  accessPrincipalId: string;
  resourceType: string;
  scopeExpression: string;
}

export type IamAccessEventPayloadByTypeV1 = {
  'iam.access-principal-created.v1': IamAccessPrincipalCreatedPayloadV1;
  'iam.role-assigned.v1': IamRoleAssignedPayloadV1;
  'iam.role-revoked.v1': IamRoleRevokedPayloadV1;
  'iam.permission-granted.v1': IamPermissionGrantedPayloadV1;
  'iam.permission-revoked.v1': IamPermissionRevokedPayloadV1;
  'iam.scope-restriction-added.v1': IamScopeRestrictionAddedPayloadV1;
  'iam.scope-restriction-removed.v1': IamScopeRestrictionRemovedPayloadV1;
};
