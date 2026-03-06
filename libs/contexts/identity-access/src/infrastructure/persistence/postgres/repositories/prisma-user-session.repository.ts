import { getPrisma } from '@whizard/shared-infrastructure';
import type { UserSessionRepository } from '../../../../application/ports/repositories/user-session.repository';
import { UserSession } from '../../../../domain';
import { toUserSessionDomain } from '../mappers/user-session.persistence.mapper';

export class PrismaUserSessionRepository implements UserSessionRepository {
  private readonly prisma = getPrisma();

  async save(session: UserSession): Promise<void> {
    const model = session.toPrimitives();

    await this.prisma.userSession.upsert({
      where: { id: model.id },
      update: {
        status: model.status,
        lastActivityAt: model.lastActivityAt,
        expiresAt: model.expiresAt,
        refreshExpiresAt: model.refreshExpiresAt,
        clientContext: model.clientContext
      },
      create: {
        id: model.id,
        userAccountId: model.userAccountId,
        status: model.status,
        issuedAt: model.issuedAt,
        lastActivityAt: model.lastActivityAt,
        expiresAt: model.expiresAt,
        refreshExpiresAt: model.refreshExpiresAt,
        clientContext: model.clientContext
      }
    });
  }

  async findActiveByUserAccountId(userAccountId: string): Promise<UserSession[]> {
    const rows = await this.prisma.userSession.findMany({
      where: {
        userAccountId,
        status: 'ACTIVE'
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    return rows.map((row) => toUserSessionDomain(row));
  }
}
