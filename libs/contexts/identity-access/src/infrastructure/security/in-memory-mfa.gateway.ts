import { randomInt, randomUUID } from 'node:crypto';
import type { MfaGateway } from '../../application/ports/gateways/mfa.gateway';
import {
  defaultMfaChallengeConfig,
  type MfaChallengeConfig
} from './mfa-challenge.config';
import { secureCompare } from './secure-compare.util';

interface StoredChallenge {
  readonly userAccountId: string;
  readonly factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
  readonly verificationCode: string;
  readonly expiresAt: number;
}

export class InMemoryMfaGateway implements MfaGateway {
  private readonly challenges = new Map<string, StoredChallenge>();

  constructor(private readonly config: MfaChallengeConfig = defaultMfaChallengeConfig) {}

  async startChallenge(input: {
    userAccountId: string;
    factorType: 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';
  }): Promise<{ challengeId: string }> {
    const challengeId = randomUUID();
    const verificationCode = this.generateNumericCode(this.config.codeLength);

    this.challenges.set(challengeId, {
      userAccountId: input.userAccountId,
      factorType: input.factorType,
      verificationCode,
      expiresAt: Date.now() + this.config.challengeTtlSeconds * 1000
    });

    return { challengeId };
  }

  async verifyChallenge(input: { challengeId: string; verificationCode: string }): Promise<boolean> {
    const challenge = this.challenges.get(input.challengeId);
    if (!challenge) {
      return false;
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(input.challengeId);
      return false;
    }

    const matches = secureCompare(challenge.verificationCode, input.verificationCode);
    if (matches) {
      this.challenges.delete(input.challengeId);
    }

    return matches;
  }

  private generateNumericCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += String(randomInt(0, 10));
    }
    return code;
  }
}
