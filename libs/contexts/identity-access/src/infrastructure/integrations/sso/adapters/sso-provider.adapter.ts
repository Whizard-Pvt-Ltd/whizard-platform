import type { VerifiedExternalIdentity } from '../models/verified-external-identity.model';

export interface SsoProviderAdapter {
  supports(providerRef: string): boolean;

  verifyExternalToken(input: {
    providerRef: string;
    externalToken: string;
  }): Promise<VerifiedExternalIdentity>;
}
