export interface UserSessionRecord {
  id: string;
  userAccountId: string;
  status: string;
  issuedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  refreshExpiresAt: Date;
  clientContext: string;
}
