export interface CredentialRecord {
  id: string;
  userAccountId: string;
  passwordHash: string;
  hashAlgo: string;
  status: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  passwordChangedAt: Date;
}
