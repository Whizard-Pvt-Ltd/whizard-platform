export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenIssuer {
  issue(input: {
    userAccountId: string;
    sessionId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): TokenPair;
}
