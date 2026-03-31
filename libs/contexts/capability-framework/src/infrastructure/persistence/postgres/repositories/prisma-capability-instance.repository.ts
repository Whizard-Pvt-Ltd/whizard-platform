import { getPrisma } from '@whizard/shared-infrastructure';
import { CapabilityInstance } from '../../../../domain/aggregates/capability-instance.aggregate';
import type { ICapabilityInstanceRepository } from '../../../../domain/repositories/capability-instance.repository';
import type { ICapabilityInstanceQueryPort } from '../../../../application/ports/repositories/capability-instance-query.port';
import type { CapabilityInstanceDto } from '../../../../application/dto/capability-instance.dto';

export class PrismaCapabilityInstanceRepository implements ICapabilityInstanceRepository, ICapabilityInstanceQueryPort {
  private readonly prisma = getPrisma();

  async findByContext(tenantId: string, fgId?: string, pwoId?: string, swoId?: string): Promise<CapabilityInstance[]> {
    const rows = await this.prisma.capabilityInstance.findMany({
      where: {
        tenantId,
        ...(fgId ? { functionalGroupId: fgId } : {}),
        ...(pwoId ? { pwoId } : {}),
        ...(swoId ? { swoId } : {})
      }
    });
    return rows.map(row =>
      CapabilityInstance.reconstitute({
        id: row.id,
        tenantId: row.tenantId,
        functionalGroupId: row.functionalGroupId,
        pwoId: row.pwoId ?? undefined,
        swoId: row.swoId ?? undefined,
        capabilityId: row.capabilityId,
        proficiencyId: row.proficiencyId
      })
    );
  }

  async findById(id: string): Promise<CapabilityInstance | null> {
    const row = await this.prisma.capabilityInstance.findUnique({ where: { id } });
    if (!row) return null;
    return CapabilityInstance.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      functionalGroupId: row.functionalGroupId,
      pwoId: row.pwoId ?? undefined,
      swoId: row.swoId ?? undefined,
      capabilityId: row.capabilityId,
      proficiencyId: row.proficiencyId
    });
  }

  async findByContextWithDetails(tenantId: string, industryId?: string, fgId?: string): Promise<CapabilityInstanceDto[]> {
    const rows = await this.prisma.capabilityInstance.findMany({
      where: {
        tenantId,
        ...(industryId ? { functionalGroup: { industryId } } : {}),
        ...(fgId ? { functionalGroupId: fgId } : {})
      },
      include: {
        pwo: { select: { name: true } },
        swo: { select: { name: true } },
        capability: { select: { code: true, name: true } },
        proficiency: { select: { level: true, label: true } }
      }
    });
    return rows.map(row => ({
      id: row.id,
      functionalGroupId: row.functionalGroupId,
      pwoId: row.pwoId ?? undefined,
      pwoName: row.pwo?.name ?? undefined,
      swoId: row.swoId ?? undefined,
      swoName: row.swo?.name ?? undefined,
      capabilityId: row.capabilityId,
      capabilityCode: row.capability.code,
      capabilityName: row.capability.name,
      proficiencyId: row.proficiencyId,
      proficiencyLevel: row.proficiency.level,
      proficiencyLabel: row.proficiency.label
    }));
  }

  async save(ci: CapabilityInstance): Promise<void> {
    await this.prisma.capabilityInstance.create({
      data: {
        id: ci.id,
        tenantId: ci.tenantId,
        functionalGroupId: ci.functionalGroupId,
        pwoId: ci.pwoId,
        swoId: ci.swoId,
        capabilityId: ci.capabilityId,
        proficiencyId: ci.proficiencyId
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.capabilityInstance.update({ where: { id }, data: { isActive: false } });
  }
}
