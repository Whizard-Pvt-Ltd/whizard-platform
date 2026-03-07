export interface MfaEnrollment {
  enrollmentId: string;
  factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
  secretRef: string;
  status: 'ACTIVE' | 'REVOKED';
  enrolledAt: Date;
  revokedAt: Date | null;
}
