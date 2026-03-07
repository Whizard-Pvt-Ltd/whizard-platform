import type { TenantType } from '../shared/transport-enums';

export interface InviteUserToTenantRequestV1 {
  userAccountId: string;
  inviteeEmail: string;
  tenantType: TenantType;
  tenantId: string;
}
