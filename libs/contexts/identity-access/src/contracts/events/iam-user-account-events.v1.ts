import type { TenantType } from '../api/shared/transport-enums';

export interface IamUserAccountCreatedPayloadV1 {
  userAccountId: string;
  email: string;
  tenantType: TenantType;
  tenantId: string;
  mfaRequired: boolean;
}

export interface IamUserAccountActivatedPayloadV1 {
  userAccountId: string;
}

export interface IamUserEmailChangedPayloadV1 {
  userAccountId: string;
  previousEmail: string;
  newEmail: string;
}

export interface IamMfaEnrolledPayloadV1 {
  userAccountId: string;
  enrollmentId: string;
  factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
}

export interface IamMfaFactorRevokedPayloadV1 {
  userAccountId: string;
  enrollmentId: string;
}

export interface IamTenantMembershipAddedPayloadV1 {
  userAccountId: string;
  membershipId: string;
  tenantType: TenantType;
  tenantId: string;
}

export type IamUserAccountEventPayloadByTypeV1 = {
  'iam.user-account-created.v1': IamUserAccountCreatedPayloadV1;
  'iam.user-account-activated.v1': IamUserAccountActivatedPayloadV1;
  'iam.user-email-changed.v1': IamUserEmailChangedPayloadV1;
  'iam.mfa-enrolled.v1': IamMfaEnrolledPayloadV1;
  'iam.mfa-factor-revoked.v1': IamMfaFactorRevokedPayloadV1;
  'iam.tenant-membership-added.v1': IamTenantMembershipAddedPayloadV1;
};
