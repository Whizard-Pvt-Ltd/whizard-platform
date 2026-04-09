import { getPrisma } from '@whizard/shared-infrastructure';
import type { CityDto } from '../dto/company.dto.js';

export class ListCitiesQueryHandler {
  async execute(): Promise<CityDto[]> {
    const prisma = getPrisma();
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return cities.map(c => ({ id: c.publicUuid, name: c.name, state: c.state }));
  }
}
