import type { FederationGateway } from '../../../application/ports/gateways/federation.gateway';
import type { SsoProviderAdapter } from './adapters/sso-provider.adapter';
import { toDomainSafeFederationInput } from './anti-corruption/external-claims.translator';

export class SsoFederationGateway implements FederationGateway {
  constructor(private readonly adapters: readonly SsoProviderAdapter[]) {}

  async verifyExternalToken(input: {
    providerRef: string;
    externalToken: string;
  }): Promise<{ externalSubjectId: string; claims: Record<string, string> }> {
    const adapter = this.adapters.find((item) => item.supports(input.providerRef));

    if (!adapter) {
      throw new Error(`No SSO adapter can handle provider: ${input.providerRef}`);
    }

    const verified = await adapter.verifyExternalToken(input);
    const translated = toDomainSafeFederationInput(verified.claims);

    return {
      externalSubjectId: translated.externalSubjectId,
      claims: translated.claims
    };
  }
}
