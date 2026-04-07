import { getPrisma } from '@whizard/shared-infrastructure';
import type { UserAccountRepository } from '../../../../application/ports/repositories/user-account.repository';
import { UserAccount } from '../../../../domain';
import { toUserAccountDomain } from '../mappers/user-account.persistence.mapper';

export class PrismaUserAccountRepository implements UserAccountRepository {
  private readonly prisma = getPrisma();

  async findByEmail(email: string): Promise<UserAccount | null> {
    const row = await this.prisma.userAccount.findUnique({
      where: { primaryEmail: email },
      include: { tenantMemberships: true }
    });
    return row ? toUserAccountDomain(row, row.tenantMemberships) : null;
  }

  async findById(id: string): Promise<UserAccount | null> {
    const row = await this.prisma.userAccount.findUnique({
      where: { publicUuid: id },
      include: { tenantMemberships: true }
    });
    return row ? toUserAccountDomain(row, row.tenantMemberships) : null;
  }

  async findByStackAuthId(stackAuthId: string): Promise<UserAccount | null> {
    const row = await this.prisma.userAccount.findUnique({
      where: { stackAuthId },
      include: { tenantMemberships: true }
    });
    return row ? toUserAccountDomain(row, row.tenantMemberships) : null;
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
          ...(model.stackAuthUserId && { stackAuthId: model.stackAuthUserId }),
          version: { increment: 1 }
        }
      });

      for (const membership of model.tenantMemberships) {
        await this.prisma.userAccountTenant.upsert({
          where: { userAccountId_tenantId: { userAccountId: existing.id, tenantId: BigInt(membership.tenantId) } },
          update: { isActive: membership.status === 'ACTIVE' },
          create: {
            userAccountId: existing.id,
            tenantId: BigInt(membership.tenantId),
            tenantType: membership.tenantType,
            isActive: membership.status === 'ACTIVE'
          }
        });
      }
    } else {
      const created = await this.prisma.userAccount.create({
        data: {
          publicUuid: model.id,
          primaryLoginId: model.email,
          primaryEmail: model.email,
          authMode: 'Password',
          mfaRequired: model.mfaRequired,
          createdAt: model.createdAt,
          activatedAt: model.activatedAt,
          lastLoginAt: model.lastLoginAt,
          stackAuthId: model.stackAuthUserId ?? undefined
        }
      });

      for (const membership of model.tenantMemberships) {
        await this.prisma.userAccountTenant.create({
          data: {
            userAccountId: created.id,
            tenantId: BigInt(membership.tenantId),
            tenantType: membership.tenantType,
            isActive: membership.status === 'ACTIVE'
          }
        });
      }
    }
  }
}
