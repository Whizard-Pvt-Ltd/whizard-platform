import { getPrisma } from '@whizard/shared-infrastructure';
import type { SkillDto } from '../../../../application/dto/skill.dto';
import type { ISkillRepository } from '../../../../domain/repositories/skill.repository';
import { Skill } from '../../../../domain/aggregates/skill.aggregate';

export class PrismaSkillRepository implements ISkillRepository {
  private readonly prisma = getPrisma();

  private async createSkill(skill: Skill): Promise<void> {
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

  private isDuplicateSkillIdError(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) return false;
    if (error.code !== 'P2002') return false;

    const target = 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta
      ? error.meta.target
      : undefined;

    if (Array.isArray(target)) {
      return target.includes('id');
    }

    return typeof target === 'string' && target.includes('id');
  }

  private async resyncSkillIdSequence(): Promise<void> {
    await this.prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('skills', 'id'),
        COALESCE((SELECT MAX(id) FROM skills), 0) + 1,
        false
      )
    `;
  }

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

  async findAllDtos(tenantId: string, capabilityInstanceId: string): Promise<SkillDto[]> {
    const rows = await this.prisma.skill.findMany({
      where: {
        tenantId: BigInt(tenantId),
        capabilityInstanceId: BigInt(capabilityInstanceId),
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
      aiImpact: r.aiImpact
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
    try {
      await this.createSkill(skill);
    } catch (error) {
      if (!this.isDuplicateSkillIdError(error)) {
        throw error;
      }

      await this.resyncSkillIdSequence();
      await this.createSkill(skill);
    }
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
