import { getPrisma } from '@whizard/shared-infrastructure';
import type { SkillDto } from '../../../../application/dto/skill.dto';
import type { ISkillRepository } from '../../../../domain/repositories/skill.repository';
import { Skill } from '../../../../domain/aggregates/skill.aggregate';

export class PrismaSkillRepository implements ISkillRepository {
  private readonly prisma = getPrisma();

  async findByCapabilityInstanceId(tenantId: string, capabilityInstanceId: string): Promise<Skill[]> {
    const rows = await this.prisma.skill.findMany({
      where: {
        tenantId: BigInt(tenantId),
        capabilityInstanceId: BigInt(capabilityInstanceId),
        isActive: true
      }
    });
    return rows.map(r => Skill.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      capabilityInstanceId: r.capabilityInstanceId.toString(),
      name: r.name,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycleMonths: r.recertificationCycleMonths,
      aiImpact: r.aiImpact
    }));
  }

  async findAllDtos(capabilityInstanceId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<SkillDto[]> {
    const rows = await this.prisma.skill.findMany({
      where: {
        capabilityInstanceId: BigInt(capabilityInstanceId),
        tenantId: { in: tenantIds.map(BigInt) },
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      capabilityInstanceId: r.capabilityInstanceId.toString(),
      name: r.name,
      cognitiveType: r.cognitiveType,
      skillCriticality: r.skillCriticality,
      recertificationCycleMonths: r.recertificationCycleMonths,
      aiImpact: r.aiImpact,
      canEdit: ownedTenantIds.includes(r.tenantId.toString())
    }));
  }

  async findById(id: string): Promise<Skill | null> {
    const r = await this.prisma.skill.findUnique({
      where: { id: BigInt(id) }
    });
    if (!r) return null;
    return Skill.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      capabilityInstanceId: r.capabilityInstanceId.toString(),
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
        tenantId: BigInt(skill.tenantId),
        capabilityInstanceId: BigInt(skill.capabilityInstanceId),
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
      where: { id: BigInt(skill.id) },
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
    await this.prisma.skill.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
