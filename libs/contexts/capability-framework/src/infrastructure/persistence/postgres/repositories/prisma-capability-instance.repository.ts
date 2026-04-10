import { getPrisma } from '@whizard/shared-infrastructure';
import type { CapabilityInstanceDto } from '../../../../application/dto/capability-instance.dto';
import type { ICapabilityInstanceQueryPort } from '../../../../application/ports/repositories/capability-instance-query.port';
import type { ICapabilityInstanceRepository } from '../../../../domain/repositories/capability-instance.repository';
import { CapabilityInstance } from '../../../../domain/aggregates/capability-instance.aggregate';

export class PrismaCapabilityInstanceRepository implements ICapabilityInstanceRepository, ICapabilityInstanceQueryPort {
  private readonly prisma = getPrisma();

  async findByContext(tenantId: string, fgId?: string, pwoId?: string, swoId?: string): Promise<CapabilityInstance[]> {
    const rows = await this.prisma.capabilityInstance.findMany({
      where: {
        tenantId: BigInt(tenantId),
        ...(fgId ? { functionalGroupId: BigInt(fgId) } : {}),
        ...(pwoId ? { pwoId: BigInt(pwoId) } : {}),
        ...(swoId ? { swoId: BigInt(swoId) } : {})
      }
    });
    return rows.map(row =>
      CapabilityInstance.reconstitute({
        id: row.id.toString(),
        tenantId: row.tenantId.toString(),
        functionalGroupId: row.functionalGroupId.toString(),
        pwoId: row.pwoId?.toString() ?? undefined,
        swoId: row.swoId?.toString() ?? undefined,
        capabilityId: row.capabilityId.toString(),
        proficiencyId: row.proficiencyId.toString()
      })
    );
  }

  async findById(id: string): Promise<CapabilityInstance | null> {
    const row = await this.prisma.capabilityInstance.findUnique({
      where: { id: BigInt(id) }
    });
    if (!row) return null;
    return CapabilityInstance.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      functionalGroupId: row.functionalGroupId.toString(),
      pwoId: row.pwoId?.toString() ?? undefined,
      swoId: row.swoId?.toString() ?? undefined,
      capabilityId: row.capabilityId.toString(),
      proficiencyId: row.proficiencyId.toString()
    });
  }

  async findByContextWithDetails(industryId?: string, fgId?: string, tenantIds?: string[], ownedTenantIds?: string[]): Promise<CapabilityInstanceDto[]> {
    const rows = await this.prisma.capabilityInstance.findMany({
      where: {
        ...(industryId ? { functionalGroup: { industryId: BigInt(industryId) } } : {}),
        ...(fgId ? { functionalGroupId: BigInt(fgId) } : {}),
        ...(tenantIds && tenantIds.length > 0 ? { tenantId: { in: tenantIds.map(BigInt) } } : {}),
      },
      include: {
        pwo: { select: { name: true, id: true } },
        swo: { select: { name: true, id: true } },
        capability: { select: { code: true, name: true, id: true } },
        proficiency: { select: { level: true, label: true, id: true } },
        functionalGroup: { select: { id: true, name: true } }
      }
    });
    return rows.map(row => ({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      functionalGroupId: row.functionalGroup.id.toString(),
      fgName: row.functionalGroup.name,
      pwoId: row.pwo?.id.toString() ?? undefined,
      pwoName: row.pwo?.name ?? undefined,
      swoId: row.swo?.id.toString() ?? undefined,
      swoName: row.swo?.name ?? undefined,
      capabilityId: row.capability.id.toString(),
      capabilityCode: row.capability.code,
      capabilityName: row.capability.name,
      proficiencyId: row.proficiency.id.toString(),
      proficiencyLevel: row.proficiency.level,
      proficiencyLabel: row.proficiency.label,
      canEdit: ownedTenantIds ? ownedTenantIds.includes(row.tenantId.toString()) : true,
    }));
  }

  async save(ci: CapabilityInstance): Promise<void> {
    await this.prisma.capabilityInstance.create({
      data: {
        tenantId: BigInt(ci.tenantId),
        functionalGroupId: BigInt(ci.functionalGroupId),
        pwoId: ci.pwoId ? BigInt(ci.pwoId) : null,
        swoId: ci.swoId ? BigInt(ci.swoId) : null,
        capabilityId: BigInt(ci.capabilityId),
        proficiencyId: BigInt(ci.proficiencyId)
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.capabilityInstance.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
