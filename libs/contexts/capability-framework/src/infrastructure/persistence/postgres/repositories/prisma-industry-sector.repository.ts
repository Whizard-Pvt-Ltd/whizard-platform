import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustrySectorRepository, IndustrySectorRecord } from '../../../../domain/repositories/industry-sector.repository';

export class PrismaIndustrySectorRepository implements IIndustrySectorRepository {
  private readonly prisma = getPrisma();

  async findAll(): Promise<IndustrySectorRecord[]> {
    const rows = await this.prisma.industrySector.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => ({
      id: r.id.toString(),
      name: r.name,
      type: r.type,
      isActive: r.isActive
    }));
  }
}
