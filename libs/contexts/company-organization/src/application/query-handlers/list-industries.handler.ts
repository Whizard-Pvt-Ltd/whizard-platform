import { getPrisma } from '@whizard/shared-infrastructure';
import type { IndustryDto } from '../dto/company.dto.js';

export class ListIndustriesQueryHandler {
  async execute(): Promise<IndustryDto[]> {
    const prisma = getPrisma();
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      include: { sector: true },
      orderBy: { name: 'asc' },
    });
    return industries.map(i => ({
      id: i.id.toString(),
      name: i.name,
      sectorName: i.sector.name,
    }));
  }
}
