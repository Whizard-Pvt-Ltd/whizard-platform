import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustryRepository, IndustryRecord } from '../../../../domain/repositories/industry.repository';

export class PrismaIndustryRepository implements IIndustryRepository {
  private readonly prisma = getPrisma();

  async findBySector(sectorId: string): Promise<IndustryRecord[]> {
    return this.prisma.industry.findMany({ where: { sectorId } });
  }
}
