import { createHmac } from 'node:crypto';
import type {
  TokenIssuerGateway,
  TokenPair
} from '../../application/ports/gateways/token-issuer.gateway';
import {
  loadJwtTokenIssuerConfig,
  type JwtTokenIssuerConfig
} from './jwt-token-issuer.config';

const base64Url = (value: string): string => {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const signJwtHs256 = (payload: Record<string, unknown>, secret: string): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
};

export class JwtTokenIssuerGateway implements TokenIssuerGateway {
  constructor(private readonly config: JwtTokenIssuerConfig = loadJwtTokenIssuerConfig()) {}

  issue(input: {
    userAccountId: string;
    sessionId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): TokenPair {
    const nowSeconds = Math.floor(Date.now() / 1000);

    const accessToken = signJwtHs256(
      {
        sub: input.userAccountId,
        sid: input.sessionId,
        tenantType: input.tenantType,
        tenantId: input.tenantId,
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: nowSeconds,
        exp: nowSeconds + this.config.accessTokenTtlSeconds,
        typ: 'access'
      },
      this.config.accessTokenSecret
    );

    const refreshToken = signJwtHs256(
      {
        sub: input.userAccountId,
        sid: input.sessionId,
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: nowSeconds,
        exp: nowSeconds + this.config.refreshTokenTtlSeconds,
        typ: 'refresh'
      },
      this.config.refreshTokenSecret
    );

    return { accessToken, refreshToken };
  }
}
