import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustrySectorRepository, IndustrySectorRecord } from '../../../../domain/repositories/industry-sector.repository';

export class PrismaIndustrySectorRepository implements IIndustrySectorRepository {
  private readonly prisma = getPrisma();

  async findAll(): Promise<IndustrySectorRecord[]> {
    const rows = await this.prisma.industrySector.findMany();
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      isActive: r.isActive
    }));
  }
}
