export interface SsoProviderConfig {
  readonly providerRef: string;
  readonly protocol: 'OIDC' | 'SAML2';
  readonly issuer?: string;
  readonly audience?: string;
  readonly jwksUri?: string;
  readonly certificatePem?: string;
}

export interface SsoIntegrationConfig {
  readonly providers: readonly SsoProviderConfig[];
}

export const defaultSsoIntegrationConfig: SsoIntegrationConfig = {
  providers: []
};
