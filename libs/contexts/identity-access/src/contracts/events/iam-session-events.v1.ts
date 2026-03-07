export interface IamSessionStartedPayloadV1 {
  sessionId: string;
  userAccountId: string;
  expiresAt: string;
}

export interface IamSessionRefreshedPayloadV1 {
  sessionId: string;
  userAccountId: string;
  refreshExpiresAt: string;
}

export interface IamSessionExpiredPayloadV1 {
  sessionId: string;
  userAccountId: string;
}

export interface IamSessionRevokedPayloadV1 {
  sessionId: string;
  userAccountId: string;
  reason: string;
}

export interface IamConcurrentSessionDeniedPayloadV1 {
  sessionId: string;
  userAccountId: string;
}

export type IamSessionEventPayloadByTypeV1 = {
  'iam.session-started.v1': IamSessionStartedPayloadV1;
  'iam.session-refreshed.v1': IamSessionRefreshedPayloadV1;
  'iam.session-expired.v1': IamSessionExpiredPayloadV1;
  'iam.session-revoked.v1': IamSessionRevokedPayloadV1;
  'iam.concurrent-session-denied.v1': IamConcurrentSessionDeniedPayloadV1;
};
