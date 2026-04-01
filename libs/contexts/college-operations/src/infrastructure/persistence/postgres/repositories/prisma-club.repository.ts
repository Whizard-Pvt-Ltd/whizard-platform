import { getPrisma } from '@whizard/shared-infrastructure';
import type { IClubRepository, ClubRecord } from '../../../../domain/repositories/club.repository.js';

export class PrismaClubRepository implements IClubRepository {
  private get prisma() { return getPrisma(); }

  async findAll(tenantId: string): Promise<ClubRecord[]> {
    const rows = await this.prisma.club.findMany({
      where: {
        isActive: true,
        OR: [
          { tenantId: BigInt(tenantId) },
          { tenant: { name: 'system' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => ({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      name: r.name,
      description: r.description,
      logoUrl: r.logoUrl,
    }));
  }
}
