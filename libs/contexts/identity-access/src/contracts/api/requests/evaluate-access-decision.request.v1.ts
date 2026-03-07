import type { TenantType } from '../shared/transport-enums';

export interface EvaluateAccessDecisionRequestV1 {
  actorUserAccountId: string;
  tenantType: TenantType;
  tenantId: string;
  permissionCode: string;
  resourceScope?: string;
}
