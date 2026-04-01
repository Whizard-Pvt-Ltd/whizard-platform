import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICityRepository, CityRecord } from '../../../../domain/repositories/city.repository.js';

export class PrismaCityRepository implements ICityRepository {
  private get prisma() { return getPrisma(); }

  async findAll(): Promise<CityRecord[]> {
    const rows = await this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => ({ id: r.id.toString(), name: r.name, state: r.state }));
  }
}
