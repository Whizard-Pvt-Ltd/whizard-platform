export interface ProvisionedAccessRecord {
  id: string;
  userAccountId: string;
  tenantType: string;
  tenantId: string;
  provisioningMode: string;
  lifecycleStatus: string;
  createdAt: Date;
  activatedAt: Date | null;
  deprovisionedAt: Date | null;
}
