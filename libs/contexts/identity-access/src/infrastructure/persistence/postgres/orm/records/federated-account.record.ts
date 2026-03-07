export interface FederatedAccountRecord {
  id: string;
  userAccountId: string;
  identityProviderId: string;
  externalSubjectId: string;
  status: string;
  linkedAt: Date;
}
