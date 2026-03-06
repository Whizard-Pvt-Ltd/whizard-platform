import type { UserSession as UserSessionRow } from '@prisma/client';
import { UserSession } from '../../../../domain';

export const toUserSessionDomain = (row: UserSessionRow): UserSession => {
  return UserSession.rehydrate({
    id: row.id,
    userAccountId: row.userAccountId,
    status: row.status as 'ACTIVE' | 'REVOKED' | 'EXPIRED',
    issuedAt: row.issuedAt,
    lastActivityAt: row.lastActivityAt,
    expiresAt: row.expiresAt,
    refreshExpiresAt: row.refreshExpiresAt,
    clientContext: row.clientContext
  });
};
