import type { AccountStatus, TenantType } from '../shared/transport-enums';

export interface UserProfileResponseV1 {
  userAccountId: string;
  email: string;
  status: AccountStatus;
  tenantType: TenantType;
  tenantId: string;
  mfaRequired: boolean;
}
