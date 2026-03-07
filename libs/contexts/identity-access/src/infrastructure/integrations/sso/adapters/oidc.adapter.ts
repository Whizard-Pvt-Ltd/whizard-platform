import type { SsoProviderConfig } from '../config/sso-integration.config';
import type { VerifiedExternalIdentity } from '../models/verified-external-identity.model';
import type { SsoProviderAdapter } from './sso-provider.adapter';

const decodeBase64UrlJson = (segment: string): Record<string, unknown> => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
};

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

export class OidcAdapter implements SsoProviderAdapter {
  constructor(private readonly providerConfigs: readonly SsoProviderConfig[]) {}

  supports(providerRef: string): boolean {
    const config = this.providerConfigs.find((item) => item.providerRef === providerRef);
    return config?.protocol === 'OIDC';
  }

  async verifyExternalToken(input: {
    providerRef: string;
    externalToken: string;
  }): Promise<VerifiedExternalIdentity> {
    const config = this.providerConfigs.find((item) => item.providerRef === input.providerRef);

    if (!config || config.protocol !== 'OIDC') {
      throw new Error(`OIDC provider is not configured: ${input.providerRef}`);
    }

    const parts = input.externalToken.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid OIDC token format.');
    }

    const payload = decodeBase64UrlJson(parts[1]);
    const subject = payload.sub;

    if (typeof subject !== 'string' || subject.length === 0) {
      throw new Error('OIDC token is missing sub claim.');
    }

    return {
      providerRef: input.providerRef,
      externalSubjectId: subject,
      claims: toClaimMap(payload)
    };
  }
}
