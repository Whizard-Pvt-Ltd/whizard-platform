import type { InvitationRecord } from '../orm/records';

export const toInvitationView = (row: InvitationRecord): Record<string, unknown> => ({
  id: row.id,
  provisionedAccessId: row.provisionedAccessId,
  invitedBy: row.invitedBy,
  inviteeEmail: row.inviteeEmail,
  tokenHash: row.tokenHash,
  status: row.status,
  expiresAt: row.expiresAt,
  acceptedAt: row.acceptedAt
});
