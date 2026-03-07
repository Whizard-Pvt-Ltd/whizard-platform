export interface AuthenticateWithPasswordResult {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
