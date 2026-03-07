import type { TenantType } from '../api';

export interface IamAccessInvitedPayloadV1 {
  provisionedAccessId: string;
  invitationId: string;
  inviteeEmail: string;
}

export interface IamAccessProvisionedPayloadV1 {
  provisionedAccessId: string;
  userAccountId: string;
  tenantType: TenantType;
  tenantId: string;
}

export interface IamAccessActivatedPayloadV1 {
  provisionedAccessId: string;
}

export interface IamAccessSuspendedPayloadV1 {
  provisionedAccessId: string;
  reason: string;
}

export interface IamAccessDeprovisionedPayloadV1 {
  provisionedAccessId: string;
}

export type IamProvisioningEventPayloadByTypeV1 = {
  'iam.access-invited.v1': IamAccessInvitedPayloadV1;
  'iam.access-provisioned.v1': IamAccessProvisionedPayloadV1;
  'iam.access-activated.v1': IamAccessActivatedPayloadV1;
  'iam.access-suspended.v1': IamAccessSuspendedPayloadV1;
  'iam.access-deprovisioned.v1': IamAccessDeprovisionedPayloadV1;
};
