export interface Credential {
  credentialId: string;
  passwordHash: string;
  hashAlgorithm: string;
  status: 'ACTIVE' | 'DISABLED';
  passwordChangedAt: Date;
}
