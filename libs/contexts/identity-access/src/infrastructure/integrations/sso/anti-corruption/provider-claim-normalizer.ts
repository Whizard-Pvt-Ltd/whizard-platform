import type { NormalizedProviderClaims } from '../models/normalized-provider-claims.model';

const toFirstString = (value: string | string[] | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string');
  }

  return value;
};

const toStringArray = (value: string | string[] | undefined): string[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const normalizeProviderClaims = (
  claims: Record<string, string | string[]>
): NormalizedProviderClaims => {
  const externalSubjectId =
    toFirstString(claims.sub) ?? toFirstString(claims.nameId) ?? toFirstString(claims.uid) ?? '';

  if (!externalSubjectId) {
    throw new Error('External subject identifier is missing in claims.');
  }

  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(claims)) {
    raw[key] = Array.isArray(value) ? value.join(',') : value;
  }

  return {
    externalSubjectId,
    email: toFirstString(claims.email) ?? toFirstString(claims.upn),
    givenName: toFirstString(claims.given_name) ?? toFirstString(claims.givenName),
    familyName: toFirstString(claims.family_name) ?? toFirstString(claims.surname),
    displayName: toFirstString(claims.name) ?? toFirstString(claims.displayName),
    groups: toStringArray(claims.groups),
    raw
  };
};
