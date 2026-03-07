export interface DomainSafeFederationInput {
  readonly externalSubjectId: string;
  readonly claims: Record<string, string>;
}
