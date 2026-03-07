import type { ProvisionedAccessRecord } from '../orm/records';

export const toProvisionedAccessView = (row: ProvisionedAccessRecord): Record<string, unknown> => ({
  id: row.id,
  userAccountId: row.userAccountId,
  tenantType: row.tenantType,
  tenantId: row.tenantId,
  provisioningMode: row.provisioningMode,
  lifecycleStatus: row.lifecycleStatus,
  createdAt: row.createdAt,
  activatedAt: row.activatedAt,
  deprovisionedAt: row.deprovisionedAt
});
