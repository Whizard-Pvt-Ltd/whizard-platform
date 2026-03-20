import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustrySectorRepository, IndustrySectorRecord } from '../../../../domain/repositories/industry-sector.repository';

export class PrismaIndustrySectorRepository implements IIndustrySectorRepository {
  private readonly prisma = getPrisma();

  async findAll(): Promise<IndustrySectorRecord[]> {
    return this.prisma.industrySector.findMany();
  }
}
