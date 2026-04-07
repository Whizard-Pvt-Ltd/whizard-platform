import type { UserAccount as UserAccountRow, UserAccountTenant as UserAccountTenantRow } from '@prisma/client';
import { UserAccount } from '../../../../domain';

type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

const isTenantType = (v: string | null | undefined): v is TenantType =>
  v === 'SYSTEM' || v === 'PARENT_CLUB' || v === 'COLLEGE' || v === 'COMPANY';

export const toUserAccountDomain = (
  row: UserAccountRow,
  tenantRows: UserAccountTenantRow[] = []
): UserAccount => {
  return UserAccount.rehydrate({
    id: row.publicUuid,
    email: row.primaryEmail,
    status: row.isActive ? 'ACTIVE' : 'SUSPENDED',
    mfaRequired: row.mfaRequired,
    stackAuthUserId: row.stackAuthId ?? null,
    createdAt: row.createdAt,
    activatedAt: row.activatedAt,
    lastLoginAt: row.lastLoginAt,
    tenantMemberships: tenantRows
      .filter((t) => t.isActive)
      .map((t) => ({
        membershipId: t.id.toString(),
        tenantType: isTenantType(t.tenantType) ? t.tenantType : 'SYSTEM',
        tenantId: t.tenantId.toString(),
        status: 'ACTIVE' as const,
        joinedAt: t.createdAt,
        revokedAt: null
      }))
  });
};
