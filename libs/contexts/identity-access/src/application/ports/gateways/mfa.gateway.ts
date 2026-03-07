export interface MfaGateway {
  startChallenge(input: {
    userAccountId: string;
    factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
  }): Promise<{ challengeId: string }>;

  verifyChallenge(input: {
    challengeId: string;
    verificationCode: string;
  }): Promise<boolean>;
}
