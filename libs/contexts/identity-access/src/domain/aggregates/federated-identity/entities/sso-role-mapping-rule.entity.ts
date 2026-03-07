export interface SsoRoleMappingRule {
  ruleId: string;
  claimName: string;
  claimMatch: string;
  mappedRoleCode: string;
  targetScope: string;
  priority: number;
}
