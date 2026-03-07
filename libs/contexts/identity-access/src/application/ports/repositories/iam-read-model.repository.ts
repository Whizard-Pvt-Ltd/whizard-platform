export interface IamReadModelRepository {
  getCurrentUserProfile(userAccountId: string): Promise<Record<string, unknown> | null>;
  getMySessions(userAccountId: string): Promise<Record<string, unknown>[]>;
  getTenantMemberships(userAccountId: string): Promise<Record<string, unknown>[]>;
  getMyAccessGrants(userAccountId: string): Promise<Record<string, unknown>[]>;
  getUserAccessAdministrationView(tenantType: string, tenantId: string): Promise<Record<string, unknown>[]>;
  getIdentityProviderConfig(providerId: string): Promise<Record<string, unknown> | null>;
  getPendingInvitations(tenantType: string, tenantId: string): Promise<Record<string, unknown>[]>;
  getProvisioningTimeline(provisionedAccessId: string): Promise<Record<string, unknown>[]>;
}
