import { getPrisma } from '@whizard/shared-infrastructure';
import type { UserAccountRepository } from '../../../../application/ports/repositories/user-account.repository';
import { UserAccount } from '../../../../domain';
import { toUserAccountDomain } from '../mappers/user-account.persistence.mapper';

export class PrismaUserAccountRepository implements UserAccountRepository {
  private readonly prisma = getPrisma();

  async findByEmail(email: string): Promise<UserAccount | null> {
    const row = await this.prisma.userAccount.findUnique({
      where: { primaryEmail: email }
    });

    return row ? toUserAccountDomain(row) : null;
  }

  async findById(id: string): Promise<UserAccount | null> {
    const row = await this.prisma.userAccount.findUnique({ where: { publicUuid: id } });
    return row ? toUserAccountDomain(row) : null;
  }

  async save(userAccount: UserAccount): Promise<void> {
    const model = userAccount.toPrimitives();

    const existing = await this.prisma.userAccount.findUnique({
      where: { primaryLoginId: model.email },
      select: { id: true }
    });

    if (existing) {
      await this.prisma.userAccount.update({
        where: { id: existing.id },
        data: {
          primaryEmail: model.email,
          primaryLoginId: model.email,
          mfaRequired: model.mfaRequired,
          activatedAt: model.activatedAt,
          lastLoginAt: model.lastLoginAt,
          version: { increment: 1 }
        }
      });
    } else {
      await this.prisma.userAccount.create({
        data: {
          publicUuid: model.id,
          primaryLoginId: model.email,
          primaryEmail: model.email,
          authMode: 'Password',
          mfaRequired: model.mfaRequired,
          createdAt: model.createdAt,
          activatedAt: model.activatedAt,
          lastLoginAt: model.lastLoginAt
        }
      });
    }
  }
}
