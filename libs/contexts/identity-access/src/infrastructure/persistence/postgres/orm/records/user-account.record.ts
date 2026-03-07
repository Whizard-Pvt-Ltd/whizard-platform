export interface UserAccountRecord {
  id: string;
  primaryLoginId: string;
  primaryEmail: string;
  authMode: string;
  status: string;
  mfaRequired: boolean;
  tenantType: string;
  tenantId: string;
  createdAt: Date;
  activatedAt: Date | null;
  lastLoginAt: Date | null;
  version: number;
}
