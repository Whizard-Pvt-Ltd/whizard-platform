import { getPrisma } from '@whizard/shared-infrastructure';
import type { Prisma } from '@prisma/client';

export class PrismaUnitOfWork {
  private readonly prisma = getPrisma();

  async execute<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => work(tx));
  }
}
