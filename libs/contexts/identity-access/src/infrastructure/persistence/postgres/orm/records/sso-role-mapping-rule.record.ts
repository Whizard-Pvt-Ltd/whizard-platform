export interface SsoRoleMappingRuleRecord {
  id: string;
  identityProviderId: string;
  claimName: string;
  claimMatch: string;
  mappedRoleCode: string;
  targetScope: string;
  priority: number;
}
