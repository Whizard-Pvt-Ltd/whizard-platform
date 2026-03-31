import { getPrisma } from '@whizard/shared-infrastructure';
import { Skill } from '../../../../domain/aggregates/skill.aggregate';
import type { ISkillRepository } from '../../../../domain/repositories/skill.repository';
import type { SkillDto } from '../../../../application/dto/skill.dto';

export class PrismaSkillRepository implements ISkillRepository {
  private readonly prisma = getPrisma();

  async findByCapabilityInstanceId(tenantId: string, capabilityInstanceId: string): Promise<Skill[]> {
    const rows = await this.prisma.skill.findMany({ where: { tenantId, capabilityInstanceId, isActive: true } });
    return rows.map(r => Skill.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      capabilityInstanceId: r.capabilityInstanceId,
      name: r.name,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycleMonths: r.recertificationCycleMonths,
      aiImpact: r.aiImpact
    }));
  }

  async findAllDtos(tenantId: string, capabilityInstanceId: string): Promise<SkillDto[]> {
    const rows = await this.prisma.skill.findMany({
      where: { tenantId, capabilityInstanceId, isActive: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      capabilityInstanceId: r.capabilityInstanceId,
      name: r.name,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycleMonths: r.recertificationCycleMonths,
      aiImpact: r.aiImpact
    }));
  }

  async findById(id: string): Promise<Skill | null> {
    const r = await this.prisma.skill.findUnique({ where: { id } });
    if (!r) return null;
    return Skill.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      capabilityInstanceId: r.capabilityInstanceId,
      name: r.name,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycleMonths: r.recertificationCycleMonths,
      aiImpact: r.aiImpact
    });
  }

  async save(skill: Skill): Promise<void> {
    await this.prisma.skill.create({
      data: {
        id: skill.id,
        tenantId: skill.tenantId,
        capabilityInstanceId: skill.capabilityInstanceId,
        name: skill.name,
        cognitiveType: skill.cognitiveType,
        skillCriticality: skill.skillCriticality,
        recertificationCycleMonths: skill.recertificationCycleMonths,
        aiImpact: skill.aiImpact
      }
    });
  }

  async update(skill: Skill): Promise<void> {
    await this.prisma.skill.update({
      where: { id: skill.id },
      data: {
        name: skill.name,
        cognitiveType: skill.cognitiveType,
        skillCriticality: skill.skillCriticality,
        recertificationCycleMonths: skill.recertificationCycleMonths,
        aiImpact: skill.aiImpact
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skill.update({ where: { id }, data: { isActive: false } });
  }
}
