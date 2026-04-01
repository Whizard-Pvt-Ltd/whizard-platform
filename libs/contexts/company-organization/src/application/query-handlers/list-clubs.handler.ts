import { getPrisma } from '@whizard/shared-infrastructure';
import type { ClubDto } from '../dto/company.dto.js';

export class ListClubsQueryHandler {
  async execute(): Promise<ClubDto[]> {
    const prisma = getPrisma();
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return clubs.map(c => ({ id: c.id, name: c.name, description: c.description, logoUrl: c.logoUrl }));
  }
}
