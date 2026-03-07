export interface AuthenticateWithPasswordResponse {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
