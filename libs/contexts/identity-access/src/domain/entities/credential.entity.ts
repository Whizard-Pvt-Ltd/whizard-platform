export interface Credential {
  userAccountId: string;
  passwordHash: string;
  hashAlgorithm: string;
  status: 'ACTIVE' | 'DISABLED';
  failedAttempts: number;
  lockedUntil: Date | null;
}
