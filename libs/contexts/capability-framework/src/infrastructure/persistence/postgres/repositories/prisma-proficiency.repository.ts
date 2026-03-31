import { getPrisma } from '@whizard/shared-infrastructure';
import type { IProficiencyRepository } from '../../../../domain/repositories/proficiency.repository';
import { Proficiency } from '../../../../domain/entities/proficiency.entity';

export class PrismaProficiencyRepository implements IProficiencyRepository {
  private readonly prisma = getPrisma();

  async findAll(): Promise<Proficiency[]> {
    const rows = await this.prisma.proficiency.findMany({ orderBy: { level: 'asc' } });
    return rows.map(row => new Proficiency({
      id: row.id,
      level: row.level,
      label: row.label,
      description: row.description ?? undefined,
      weightage: row.weightage ?? undefined,
      isActive: row.isActive
    }));
  }

  async findById(id: string): Promise<Proficiency | null> {
    const row = await this.prisma.proficiency.findUnique({ where: { id } });
    if (!row) return null;
    return new Proficiency({
      id: row.id,
      level: row.level,
      label: row.label,
      description: row.description ?? undefined,
      weightage: row.weightage ?? undefined,
      isActive: row.isActive
    });
  }
}
