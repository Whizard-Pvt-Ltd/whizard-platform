import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustryRepository, IndustryRecord } from '../../../../domain/repositories/industry.repository';

export class PrismaIndustryRepository implements IIndustryRepository {
  private readonly prisma = getPrisma();

  async findBySector(sectorId: string): Promise<IndustryRecord[]> {
    const rows = await this.prisma.industry.findMany({
      where: { sectorId: BigInt(sectorId) },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      sectorId: r.sectorId.toString(),
      name: r.name,
      isActive: r.isActive
    }));
  }
}
