export interface VerifiedExternalIdentity {
  readonly providerRef: string;
  readonly externalSubjectId: string;
  readonly claims: Record<string, string | string[]>;
}
