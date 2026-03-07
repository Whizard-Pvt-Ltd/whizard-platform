export interface TenantMembership {
  membershipId: string;
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  status: 'ACTIVE' | 'REVOKED';
  joinedAt: Date;
  revokedAt: Date | null;
}
