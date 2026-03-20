import { getPrisma } from '@whizard/shared-infrastructure';
import { CapabilityInstance } from '../../../../domain/aggregates/capability-instance.aggregate';
import type { ICapabilityInstanceRepository } from '../../../../domain/repositories/capability-instance.repository';

export class PrismaCapabilityInstanceRepository implements ICapabilityInstanceRepository {
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
        versionId: row.versionId ?? undefined,
        functionalGroupId: row.functionalGroupId,
        pwoId: row.pwoId,
        swoId: row.swoId,
        capabilityId: row.capabilityId,
        proficiencyId: row.proficiencyId
      })
    );
  }

  async save(ci: CapabilityInstance): Promise<void> {
    await this.prisma.capabilityInstance.create({
      data: {
        id: ci.id,
        tenantId: ci.tenantId,
        versionId: ci.versionId,
        functionalGroupId: ci.functionalGroupId,
        pwoId: ci.pwoId,
        swoId: ci.swoId,
        capabilityId: ci.capabilityId,
        proficiencyId: ci.proficiencyId
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.capabilityInstance.delete({ where: { id } });
  }
}
