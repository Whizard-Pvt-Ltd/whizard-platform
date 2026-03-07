export interface SessionTokenRecord {
  id: string;
  sessionId: string;
  tokenType: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}
