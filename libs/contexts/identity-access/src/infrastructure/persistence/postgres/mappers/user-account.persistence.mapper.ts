import type { UserAccount as UserAccountRow } from '@prisma/client';
import { UserAccount } from '../../../../domain';

export const toUserAccountDomain = (row: UserAccountRow): UserAccount => {
  return UserAccount.rehydrate({
    id: row.id,
    email: row.primaryEmail,
    tenantType: 'SYSTEM',
    tenantId: 'system',
    status: row.isActive ? 'ACTIVE' : 'SUSPENDED',
    mfaRequired: row.mfaRequired,
    stackAuthUserId: null,
    createdAt: row.createdAt,
    activatedAt: row.activatedAt,
    lastLoginAt: row.lastLoginAt
  });
};
