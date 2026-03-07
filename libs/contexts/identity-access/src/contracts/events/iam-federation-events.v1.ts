import type { TenantType } from '../api';

export interface IamIdpCreatedPayloadV1 {
  identityProviderId: string;
  protocolType: 'OIDC' | 'SAML2' | 'OAUTH2';
  tenantType: TenantType;
  tenantId: string;
}

export interface IamFederatedAccountLinkedPayloadV1 {
  federatedAccountId: string;
  userAccountId: string;
  identityProviderId: string;
}

export interface IamFederatedLoginSucceededPayloadV1 {
  federatedAccountId: string;
  userAccountId: string;
}

export interface IamFederatedLoginFailedPayloadV1 {
  federatedAccountId: string;
  userAccountId: string;
  reason: string;
}

export interface IamSsoRoleMappingUpdatedPayloadV1 {
  federatedAccountId: string;
  ruleCount: number;
}

export type IamFederationEventPayloadByTypeV1 = {
  'iam.idp-created.v1': IamIdpCreatedPayloadV1;
  'iam.federated-account-linked.v1': IamFederatedAccountLinkedPayloadV1;
  'iam.federated-login-succeeded.v1': IamFederatedLoginSucceededPayloadV1;
  'iam.federated-login-failed.v1': IamFederatedLoginFailedPayloadV1;
  'iam.sso-role-mapping-updated.v1': IamSsoRoleMappingUpdatedPayloadV1;
};
