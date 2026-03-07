export interface NormalizedProviderClaims {
  readonly externalSubjectId: string;
  readonly email?: string;
  readonly givenName?: string;
  readonly familyName?: string;
  readonly displayName?: string;
  readonly groups: readonly string[];
  readonly raw: Record<string, string>;
}
