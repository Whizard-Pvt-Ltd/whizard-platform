import { getPrisma } from '@whizard/shared-infrastructure';
import { PrimaryWorkObject } from '../../../../domain/aggregates/primary-work-object.aggregate';
import type { IPwoRepository } from '../../../../domain/repositories/pwo.repository';
import { resolveImpactLevel, CRITICALITY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';
import type { StrategicImportance } from '../../../../domain/value-objects/strategic-importance.vo';

export class PrismaPwoRepository implements IPwoRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<PrimaryWorkObject | null> {
    const row = await this.prisma.primaryWorkObject.findUnique({ where: { id } });
    if (!row) return null;
    return PrimaryWorkObject.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      versionId: String(row.version),
      functionalGroupId: row.functionalGroupId,
      name: row.name,
      strategicImportance: row.strategicImportanceLevel as StrategicImportance,
      revenueImpact: resolveImpactLevel(row.revenueImpactLevel, CRITICALITY_LEVELS),
      downtimeSensitivity: resolveImpactLevel(row.downtimeSensitivity, CRITICALITY_LEVELS),
      isActive: row.isActive
    });
  }

  async findByFG(fgId: string, tenantId: string): Promise<PrimaryWorkObject[]> {
    const rows = await this.prisma.primaryWorkObject.findMany({
      where: { functionalGroupId: fgId, tenantId }
    });
    return rows.map(row =>
      PrimaryWorkObject.reconstitute({
        id: row.id,
        tenantId: row.tenantId,
        versionId: String(row.version),
        functionalGroupId: row.functionalGroupId,
        name: row.name,
        strategicImportance: row.strategicImportanceLevel as StrategicImportance,
        revenueImpact: resolveImpactLevel(row.revenueImpactLevel, CRITICALITY_LEVELS),
        downtimeSensitivity: resolveImpactLevel(row.downtimeSensitivity, CRITICALITY_LEVELS),
        isActive: row.isActive
      })
    );
  }

  async save(pwo: PrimaryWorkObject): Promise<void> {
    await this.prisma.primaryWorkObject.upsert({
      where: { id: pwo.id },
      update: {
        name: pwo.name,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive
      },
      create: {
        id: pwo.id,
        tenantId: pwo.tenantId,
        version: Number(pwo.versionId ?? 1),
        functionalGroupId: pwo.functionalGroupId,
        name: pwo.name,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.primaryWorkObject.delete({ where: { id } });
  }

  async hasSWOs(pwoId: string): Promise<boolean> {
    const count = await this.prisma.secondaryWorkObject.count({
      where: { pwoId, isActive: true }
    });
    return count > 0;
  }
}
