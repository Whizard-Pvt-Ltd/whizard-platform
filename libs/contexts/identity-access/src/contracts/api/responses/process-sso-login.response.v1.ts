export interface ProcessSsoLoginResponseV1 {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  isProvisioned: boolean;
}
