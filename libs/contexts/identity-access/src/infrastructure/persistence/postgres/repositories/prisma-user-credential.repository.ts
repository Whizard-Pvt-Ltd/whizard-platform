import type { IUserCredentialRepository } from '../../../../application/ports/repositories/user-credential.repository';
import { UserCredential } from '../../../../domain/entities/user-credential.entity';

export class PrismaUserCredentialRepository implements IUserCredentialRepository {
  async findByUserAccountId(_userAccountId: string): Promise<UserCredential | null> {
    return null;
  }

  async save(_credential: UserCredential): Promise<void> {
    // no-op: userCredential table removed from schema
  }

  async delete(_userAccountId: string): Promise<void> {
    // no-op: userCredential table removed from schema
  }
}
