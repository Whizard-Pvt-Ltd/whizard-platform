import type { CredentialRepository } from '../../../../application/ports/repositories/credential.repository';
import type { Credential } from '../../../../domain/entities/credential.entity';

export class PrismaCredentialRepository implements CredentialRepository {
  async findActiveByUserAccountId(_userAccountId: string): Promise<Credential | null> {
    return null;
  }
}
