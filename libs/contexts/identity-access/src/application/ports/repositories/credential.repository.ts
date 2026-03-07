import type { Credential } from '../../../domain/entities/credential.entity';

export interface CredentialRepository {
  findActiveByUserAccountId(userAccountId: string): Promise<Credential | null>;
}
