import type { IdentityProviderRecord } from '../orm/records';

export const toIdentityProviderView = (row: IdentityProviderRecord): Record<string, unknown> => ({
  id: row.id,
  tenantType: row.tenantType,
  tenantId: row.tenantId,
  protocolType: row.protocolType,
  providerName: row.providerName,
  config: row.configJson,
  status: row.status
});
