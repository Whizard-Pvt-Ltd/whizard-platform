import type { ProvisioningLifecycleStatus, TenantType } from '../shared/transport-enums';

export interface InvitationResponseV1 {
  invitationId: string;
  provisionedAccessId: string;
  inviteeEmail: string;
  tenantType: TenantType;
  tenantId: string;
  lifecycleStatus: ProvisioningLifecycleStatus;
  expiresAt: string;
}
