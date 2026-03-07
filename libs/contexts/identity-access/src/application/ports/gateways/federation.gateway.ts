export interface FederationGateway {
  verifyExternalToken(input: {
    providerRef: string;
    externalToken: string;
  }): Promise<{ externalSubjectId: string; claims: Record<string, string> }>;
}
