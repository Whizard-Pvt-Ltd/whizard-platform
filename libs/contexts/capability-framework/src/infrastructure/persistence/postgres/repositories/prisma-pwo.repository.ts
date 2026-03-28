import { getPrisma } from '@whizard/shared-infrastructure';
import type { IPwoRepository } from '../../../../domain/repositories/pwo.repository';
import type { StrategicImportance } from '../../../../domain/value-objects/strategic-importance.vo';
import { PrimaryWorkObject } from '../../../../domain/aggregates/primary-work-object.aggregate';
import { resolveImpactLevel, CRITICALITY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';

export class PrismaPwoRepository implements IPwoRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<PrimaryWorkObject | null> {
    const row = await this.prisma.primaryWorkObject.findUnique({ where: { id } });
    if (!row) return null;
    return PrimaryWorkObject.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      versionId: row.versionId ?? undefined,
      functionalGroupId: row.functionalGroupId,
      name: row.name,
      description: row.description ?? undefined,
      strategicImportance: row.strategicImportance as StrategicImportance,
      revenueImpact: resolveImpactLevel(row.revenueImpact, CRITICALITY_LEVELS),
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
        versionId: row.versionId ?? undefined,
        functionalGroupId: row.functionalGroupId,
        name: row.name,
        description: row.description ?? undefined,
        strategicImportance: row.strategicImportance as StrategicImportance,
        revenueImpact: resolveImpactLevel(row.revenueImpact, CRITICALITY_LEVELS),
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
        description: pwo.description,
        strategicImportance: pwo.strategicImportance,
        revenueImpact: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive
      },
      create: {
        id: pwo.id,
        tenantId: pwo.tenantId,
        versionId: pwo.versionId,
        functionalGroupId: pwo.functionalGroupId,
        name: pwo.name,
        description: pwo.description,
        strategicImportance: pwo.strategicImportance,
        revenueImpact: pwo.revenueImpact.label,
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
