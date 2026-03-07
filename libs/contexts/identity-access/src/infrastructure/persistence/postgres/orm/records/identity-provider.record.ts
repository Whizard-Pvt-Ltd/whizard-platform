export interface IdentityProviderRecord {
  id: string;
  tenantType: string;
  tenantId: string;
  protocolType: string;
  providerName: string;
  configJson: Record<string, unknown>;
  status: string;
}
