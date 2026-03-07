import type { AuthenticationMode } from '../shared/transport-enums';

export interface AuthenticateWithPasswordResponseV1 {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  authenticationMode: AuthenticationMode;
}
