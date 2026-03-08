import type { UserCredential } from '../../../domain/entities/user-credential.entity';

export interface IUserCredentialRepository {
  findByUserAccountId(userAccountId: string): Promise<UserCredential | null>;
  save(credential: UserCredential): Promise<void>;
  delete(userAccountId: string): Promise<void>;
}
