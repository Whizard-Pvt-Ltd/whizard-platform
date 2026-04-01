import { getPrisma } from '@whizard/shared-infrastructure';
import type { IPwoRepository } from '../../../../domain/repositories/pwo.repository';
import type { StrategicImportance } from '../../../../domain/value-objects/strategic-importance.vo';
import { PrimaryWorkObject } from '../../../../domain/aggregates/primary-work-object.aggregate';
import { resolveImpactLevel, CRITICALITY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';

export class PrismaPwoRepository implements IPwoRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<PrimaryWorkObject | null> {
    const row = await this.prisma.primaryWorkObject.findUnique({
      where: { id: BigInt(id) }
    });
    if (!row) return null;
    return PrimaryWorkObject.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      versionId: String(row.version),
      functionalGroupId: row.functionalGroupId.toString(),
      name: row.name,
      strategicImportance: row.strategicImportanceLevel as StrategicImportance,
      revenueImpact: resolveImpactLevel(row.revenueImpactLevel, CRITICALITY_LEVELS),
      downtimeSensitivity: resolveImpactLevel(row.downtimeSensitivity, CRITICALITY_LEVELS),
      isActive: row.isActive
    });
  }

  async findByFG(fgId: string, tenantId: string): Promise<PrimaryWorkObject[]> {
    const rows = await this.prisma.primaryWorkObject.findMany({
      where: {
        functionalGroupId: BigInt(fgId),
        tenantId: BigInt(tenantId)
      }
    });
    return rows.map(row =>
      PrimaryWorkObject.reconstitute({
        id: row.id.toString(),
        tenantId: row.tenantId.toString(),
        versionId: String(row.version),
        functionalGroupId: row.functionalGroupId.toString(),
        name: row.name,
        strategicImportance: row.strategicImportanceLevel as StrategicImportance,
        revenueImpact: resolveImpactLevel(row.revenueImpactLevel, CRITICALITY_LEVELS),
        downtimeSensitivity: resolveImpactLevel(row.downtimeSensitivity, CRITICALITY_LEVELS),
        isActive: row.isActive
      })
    );
  }

  async save(pwo: PrimaryWorkObject): Promise<void> {
    const tenantId = BigInt(pwo.tenantId);
    const functionalGroupId = BigInt(pwo.functionalGroupId);

    await this.prisma.primaryWorkObject.upsert({
      where: { id: BigInt(pwo.id) },
      update: {
        name: pwo.name,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive
      },
      create: {
        tenantId,
        version: Number(pwo.versionId ?? 1),
        functionalGroupId,
        name: pwo.name,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.primaryWorkObject.delete({ where: { id: BigInt(id) } });
  }

  async hasSWOs(pwoId: string): Promise<boolean> {
    const count = await this.prisma.secondaryWorkObject.count({
      where: { pwoId: BigInt(pwoId), isActive: true }
    });
    return count > 0;
  }
}
