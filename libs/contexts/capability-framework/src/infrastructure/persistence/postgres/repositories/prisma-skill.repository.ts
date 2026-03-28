import { getPrisma } from '@whizard/shared-infrastructure';
import type { SkillDto } from '../../../../application/dto/skill.dto';
import type { ISkillRepository } from '../../../../domain/repositories/skill.repository';
import { Skill } from '../../../../domain/aggregates/skill.aggregate';

export class PrismaSkillRepository implements ISkillRepository {
  private readonly prisma = getPrisma();

  async findByCiId(tenantId: string, ciId: string): Promise<Skill[]> {
    const rows = await this.prisma.skill.findMany({ where: { tenantId, ciId, isActive: true } });
    return rows.map(r => Skill.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      ciId: r.ciId,
      name: r.name,
      description: r.description ?? undefined,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycle: r.recertificationCycle,
      aiImpact: r.aiImpact
    }));
  }

  async findAllDtos(tenantId: string, ciId: string): Promise<SkillDto[]> {
    const rows = await this.prisma.skill.findMany({
      where: { tenantId, ciId, isActive: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      ciId: r.ciId,
      name: r.name,
      description: r.description ?? undefined,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycle: r.recertificationCycle,
      aiImpact: r.aiImpact
    }));
  }

  async findById(id: string): Promise<Skill | null> {
    const r = await this.prisma.skill.findUnique({ where: { id } });
    if (!r) return null;
    return Skill.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      ciId: r.ciId,
      name: r.name,
      description: r.description ?? undefined,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycle: r.recertificationCycle,
      aiImpact: r.aiImpact
    });
  }

  async save(skill: Skill): Promise<void> {
    await this.prisma.skill.create({
      data: {
        id: skill.id,
        tenantId: skill.tenantId,
        ciId: skill.ciId,
        name: skill.name,
        description: skill.description,
        cognitiveType: skill.cognitiveType,
        skillCriticality: skill.skillCriticality,
        recertificationCycle: skill.recertificationCycle,
        aiImpact: skill.aiImpact
      }
    });
  }

  async update(skill: Skill): Promise<void> {
    await this.prisma.skill.update({
      where: { id: skill.id },
      data: {
        name: skill.name,
        description: skill.description,
        cognitiveType: skill.cognitiveType,
        skillCriticality: skill.skillCriticality,
        recertificationCycle: skill.recertificationCycle,
        aiImpact: skill.aiImpact
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skill.update({ where: { id }, data: { isActive: false } });
  }
}
