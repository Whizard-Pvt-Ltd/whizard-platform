export interface AccessPrincipalRecord {
  id: string;
  userAccountId: string;
  tenantType: string;
  tenantId: string;
  status: string;
  createdAt: Date;
  version: number;
}
