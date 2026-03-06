import type { UserAccount as UserAccountRow } from '@prisma/client';
import { UserAccount } from '../../../../domain';

export const toUserAccountDomain = (row: UserAccountRow): UserAccount => {
  return UserAccount.rehydrate({
    id: row.id,
    email: row.primaryEmail,
    tenantType: row.tenantType as 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY',
    tenantId: row.tenantId,
    status: row.status as 'PENDING' | 'ACTIVE' | 'SUSPENDED',
    mfaRequired: row.mfaRequired,
    createdAt: row.createdAt,
    activatedAt: row.activatedAt,
    lastLoginAt: row.lastLoginAt
  });
};
