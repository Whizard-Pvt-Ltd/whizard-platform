import { UserAccount } from '../../../domain';

export interface UserAccountRepository {
  findByEmail(email: string): Promise<UserAccount | null>;
  findById(id: string): Promise<UserAccount | null>;
  save(userAccount: UserAccount): Promise<void>;
}
