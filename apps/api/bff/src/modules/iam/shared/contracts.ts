export interface ApiMetaV1 {
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorV1 {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessEnvelopeV1<TData> {
  success: true;
  data: TData;
  meta: ApiMetaV1;
}

export interface ApiFailureEnvelopeV1 {
  success: false;
  error: ApiErrorV1;
  meta: ApiMetaV1;
}

export type ApiEnvelopeV1<TData> = ApiSuccessEnvelopeV1<TData> | ApiFailureEnvelopeV1;

export interface AuthenticateWithPasswordRequestV1 {
  email: string;
  password: string;
}

export interface AuthenticateWithPasswordResponseV1 {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  authenticationMode: 'LOCAL_PASSWORD' | 'SSO';
}

export interface StartMfaChallengeRequestV1 {
  factorType: 'TOTP' | 'SMS' | 'EMAIL';
}

export interface VerifyMfaChallengeRequestV1 {
  challengeId: string;
  code: string;
}

export interface RefreshSessionRequestV1 {
  refreshToken: string;
}

export interface EvaluateAccessDecisionResponseV1 {
  effect: 'ALLOW' | 'DENY';
  reason?: string;
}

export interface SessionViewV1 {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  authenticationMode: 'LOCAL_PASSWORD' | 'SSO';
}

export interface UserProfileResponseV1 {
  userAccountId: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  mfaRequired: boolean;
}
