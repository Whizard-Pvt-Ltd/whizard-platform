import type { UserSessionRepository } from '../../../../application/ports/repositories/user-session.repository';
import { UserSession } from '../../../../domain';

export class PrismaUserSessionRepository implements UserSessionRepository {
  async save(_session: UserSession): Promise<void> {
    // no-op: userSession table removed from schema
  }

  async findActiveByUserAccountId(_userAccountId: string): Promise<UserSession[]> {
    return [];
  }
}
