export interface IdentityProvider {
  providerId: string;
  protocolType: 'OIDC' | 'SAML2' | 'OAUTH2';
  providerName: string;
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: Date;
}
