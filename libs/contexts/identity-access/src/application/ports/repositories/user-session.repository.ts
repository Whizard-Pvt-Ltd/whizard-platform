import { UserSession } from '../../../domain';

export interface UserSessionRepository {
  save(session: UserSession): Promise<void>;
  findActiveByUserAccountId(userAccountId: string): Promise<UserSession[]>;
}
