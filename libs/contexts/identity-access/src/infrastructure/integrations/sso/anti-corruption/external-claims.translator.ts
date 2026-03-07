import type { DomainSafeFederationInput } from '../models/domain-safe-federation-input.model';
import { normalizeProviderClaims } from './provider-claim-normalizer';

export const toDomainSafeFederationInput = (
  claims: Record<string, string | string[]>
): DomainSafeFederationInput => {
  const normalized = normalizeProviderClaims(claims);

  return {
    externalSubjectId: normalized.externalSubjectId,
    claims: {
      externalSubjectId: normalized.externalSubjectId,
      ...(normalized.email ? { email: normalized.email } : {}),
      ...(normalized.givenName ? { givenName: normalized.givenName } : {}),
      ...(normalized.familyName ? { familyName: normalized.familyName } : {}),
      ...(normalized.displayName ? { displayName: normalized.displayName } : {}),
      ...(normalized.groups.length ? { groups: normalized.groups.join(',') } : {})
    }
  };
};
