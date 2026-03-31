import { UserSession } from '../../../../domain';

interface UserSessionRow {
  id: string;
  userAccountId: string;
  status: string;
  issuedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  refreshExpiresAt: Date | null;
  clientContext: string | null;
}

export const toUserSessionDomain = (row: UserSessionRow): UserSession => {
  return UserSession.rehydrate({
    id: row.id,
    userAccountId: row.userAccountId,
    status: row.status as 'ACTIVE' | 'REVOKED' | 'EXPIRED',
    issuedAt: row.issuedAt,
    lastActivityAt: row.lastActivityAt,
    expiresAt: row.expiresAt,
    refreshExpiresAt: row.refreshExpiresAt ?? new Date(),
    clientContext: row.clientContext ?? ''
  });
};
