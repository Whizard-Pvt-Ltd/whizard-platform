import type { SsoProviderConfig } from '../config/sso-integration.config';
import type { VerifiedExternalIdentity } from '../models/verified-external-identity.model';
import type { SsoProviderAdapter } from './sso-provider.adapter';

const toClaimMap = (input: Record<string, unknown>): Record<string, string | string[]> => {
  const out: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      out[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      const asStrings = value.filter((item): item is string => typeof item === 'string');
      if (asStrings.length > 0) {
        out[key] = asStrings;
      }
    }
  }

  return out;
};

export class SamlAdapter implements SsoProviderAdapter {
  constructor(private readonly providerConfigs: readonly SsoProviderConfig[]) {}

  supports(providerRef: string): boolean {
    const config = this.providerConfigs.find((item) => item.providerRef === providerRef);
    return config?.protocol === 'SAML2';
  }

  async verifyExternalToken(input: {
    providerRef: string;
    externalToken: string;
  }): Promise<VerifiedExternalIdentity> {
    const config = this.providerConfigs.find((item) => item.providerRef === input.providerRef);

    if (!config || config.protocol !== 'SAML2') {
      throw new Error(`SAML provider is not configured: ${input.providerRef}`);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(input.externalToken) as Record<string, unknown>;
    } catch {
      throw new Error('SAML adapter expects a pre-parsed assertion JSON payload placeholder.');
    }

    const subject = parsed.nameId ?? parsed.sub;
    if (typeof subject !== 'string' || subject.length === 0) {
      throw new Error('SAML assertion missing nameId/sub identifier.');
    }

    return {
      providerRef: input.providerRef,
      externalSubjectId: subject,
      claims: toClaimMap(parsed)
    };
  }
}
