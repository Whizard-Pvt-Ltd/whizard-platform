import type { TenantType } from '../../domain';

export interface RegisterLocalUserCommand {
  email: string;
  tenantType: TenantType;
  tenantId: string;
  mfaRequired?: boolean;
}
