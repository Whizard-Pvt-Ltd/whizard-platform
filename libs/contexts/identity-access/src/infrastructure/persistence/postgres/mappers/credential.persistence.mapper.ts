import type { Credential as CredentialRow } from '@prisma/client';
import type { Credential } from '../../../../domain/entities/credential.entity';

export const toCredentialDomain = (row: CredentialRow): Credential => {
  return {
    userAccountId: row.userAccountId,
    passwordHash: row.passwordHash,
    hashAlgorithm: row.hashAlgo,
    status: row.status as 'ACTIVE' | 'DISABLED',
    failedAttempts: row.failedAttempts,
    lockedUntil: row.lockedUntil
  };
};
