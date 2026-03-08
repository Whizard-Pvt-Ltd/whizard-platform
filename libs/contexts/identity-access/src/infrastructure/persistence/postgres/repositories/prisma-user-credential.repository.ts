import { PrismaClient } from '@prisma/client';
import type { IUserCredentialRepository } from '../../../../application/ports/repositories/user-credential.repository';
import { UserCredential } from '../../../../domain/entities/user-credential.entity';

export class PrismaUserCredentialRepository implements IUserCredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAccountId(userAccountId: string): Promise<UserCredential | null> {
    const record = await this.prisma.userCredential.findUnique({
      where: { userAccountId }
    });

    if (!record) {
      return null;
    }

    return UserCredential.rehydrate({
      userAccountId: record.userAccountId,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }

  async save(credential: UserCredential): Promise<void> {
    const primitives = credential.toPrimitives();

    await this.prisma.userCredential.upsert({
      where: { userAccountId: primitives.userAccountId },
      create: {
        userAccountId: primitives.userAccountId,
        passwordHash: primitives.passwordHash,
        createdAt: primitives.createdAt,
        updatedAt: primitives.updatedAt
      },
      update: {
        passwordHash: primitives.passwordHash,
        updatedAt: primitives.updatedAt
      }
    });
  }

  async delete(userAccountId: string): Promise<void> {
    await this.prisma.userCredential.delete({
      where: { userAccountId }
    });
  }
}
