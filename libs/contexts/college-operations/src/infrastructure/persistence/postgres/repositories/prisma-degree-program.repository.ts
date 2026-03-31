import { getPrisma } from '@whizard/shared-infrastructure';
import type { IDegreeProgramRepository, DegreeProgramRecord } from '../../../../domain/repositories/degree-program.repository.js';

export class PrismaDegreeProgramRepository implements IDegreeProgramRepository {
  private get prisma() { return getPrisma(); }

  async findAll(): Promise<DegreeProgramRecord[]> {
    const rows = await this.prisma.degreeProgram.findMany({
      where: { isActive: true },
      include: { specializations: { where: { isActive: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => ({
      id: r.id, name: r.name, level: r.level, durationYears: r.durationYears,
      specializations: r.specializations.map(s => ({ id: s.id, name: s.name })),
    }));
  }
}
