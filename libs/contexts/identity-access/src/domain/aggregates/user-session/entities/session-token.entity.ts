export interface SessionToken {
  tokenId: string;
  tokenType: 'ACCESS' | 'REFRESH' | 'ONE_TIME';
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}
