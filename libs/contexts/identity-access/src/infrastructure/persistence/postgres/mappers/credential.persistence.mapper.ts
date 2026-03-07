import type { Credential } from '../../../../domain/entities/credential.entity';
import type { CredentialRecord } from '../orm/records';

export const toCredentialDomain = (row: CredentialRecord): Credential => {
  return {
    userAccountId: row.userAccountId,
    passwordHash: row.passwordHash,
    hashAlgorithm: row.hashAlgo,
    status: row.status as 'ACTIVE' | 'DISABLED',
    failedAttempts: row.failedAttempts,
    lockedUntil: row.lockedUntil
  };
};
