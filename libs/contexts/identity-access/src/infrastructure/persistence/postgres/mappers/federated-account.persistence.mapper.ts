import type { FederatedAccountRecord } from '../orm/records';

export const toFederatedAccountView = (row: FederatedAccountRecord): Record<string, unknown> => ({
  id: row.id,
  userAccountId: row.userAccountId,
  identityProviderId: row.identityProviderId,
  externalSubjectId: row.externalSubjectId,
  status: row.status,
  linkedAt: row.linkedAt
});
