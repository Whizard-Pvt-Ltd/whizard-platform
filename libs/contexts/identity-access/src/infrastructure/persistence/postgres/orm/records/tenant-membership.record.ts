export interface TenantMembershipRecord {
  id: string;
  userAccountId: string;
  tenantType: string;
  tenantId: string;
  status: string;
  joinedAt: Date;
  revokedAt: Date | null;
}
