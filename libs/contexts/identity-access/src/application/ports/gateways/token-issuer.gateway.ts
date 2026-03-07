export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenIssuerGateway {
  issue(input: {
    userAccountId: string;
    sessionId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): TokenPair;
}
