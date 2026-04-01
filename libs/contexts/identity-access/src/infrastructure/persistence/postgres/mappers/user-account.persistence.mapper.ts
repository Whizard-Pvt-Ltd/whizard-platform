import type { UserAccount as UserAccountRow } from '@prisma/client';
import { UserAccount } from '../../../../domain';

export const toUserAccountDomain = (row: UserAccountRow): UserAccount => {
  return UserAccount.rehydrate({
    id: row.id.toString(),
    email: row.primaryEmail,
    tenantType: 'SYSTEM',
    tenantId: process.env['SYSTEM_TENANT_ID'] ?? process.env['STACK_AUTH_DEFAULT_TENANT_ID'] ?? '1',
    status: row.isActive ? 'ACTIVE' : 'SUSPENDED',
    mfaRequired: row.mfaRequired,
    stackAuthUserId: null,
    createdAt: row.createdAt,
    activatedAt: row.activatedAt,
    lastLoginAt: row.lastLoginAt
  });
};
