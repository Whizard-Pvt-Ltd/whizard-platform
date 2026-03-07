export interface MfaEnrollmentRecord {
  id: string;
  userAccountId: string;
  factorType: string;
  secretRef: string;
  status: string;
  enrolledAt: Date;
  lastUsedAt: Date | null;
}
