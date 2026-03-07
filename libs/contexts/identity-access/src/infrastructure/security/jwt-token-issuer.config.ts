export interface JwtTokenIssuerConfig {
  readonly accessTokenSecret: string;
  readonly refreshTokenSecret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly accessTokenTtlSeconds: number;
  readonly refreshTokenTtlSeconds: number;
}

const assertSecret = (value: string | undefined, envKey: string): string => {
  if (!value || value.trim().length < 32) {
    throw new Error(`${envKey} must be set and at least 32 characters long.`);
  }
  return value;
};

export const loadJwtTokenIssuerConfig = (): JwtTokenIssuerConfig => {
  return {
    accessTokenSecret: assertSecret(process.env.IAM_ACCESS_TOKEN_SECRET, 'IAM_ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: assertSecret(
      process.env.IAM_REFRESH_TOKEN_SECRET,
      'IAM_REFRESH_TOKEN_SECRET'
    ),
    issuer: process.env.IAM_JWT_ISSUER ?? 'whizard.identity-access',
    audience: process.env.IAM_JWT_AUDIENCE ?? 'whizard.clients',
    accessTokenTtlSeconds: Number(process.env.IAM_ACCESS_TOKEN_TTL_SECONDS ?? 1800),
    refreshTokenTtlSeconds: Number(process.env.IAM_REFRESH_TOKEN_TTL_SECONDS ?? 604800)
  };
};
