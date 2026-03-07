import type { TenantType } from '../shared/transport-enums';

export interface RegisterLocalUserRequestV1 {
  email: string;
  password: string;
  tenantType: TenantType;
  tenantId: string;
  mfaRequired: boolean;
}
