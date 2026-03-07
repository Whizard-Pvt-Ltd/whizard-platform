export interface AuthorizationGateway {
  assertCan(input: {
    actorUserAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    permissionCode: string;
  }): Promise<void>;
}
