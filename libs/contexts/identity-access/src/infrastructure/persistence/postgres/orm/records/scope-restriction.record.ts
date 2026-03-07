export interface ScopeRestrictionRecord {
  id: string;
  accessPrincipalId: string;
  resourceType: string;
  restrictionType: string;
  scopeExpression: string;
  createdAt: Date;
}
