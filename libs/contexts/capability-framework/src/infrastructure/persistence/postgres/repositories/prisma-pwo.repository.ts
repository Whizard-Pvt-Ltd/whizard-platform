import { getPrisma } from '@whizard/shared-infrastructure';
import type { IPwoRepository } from '../../../../domain/repositories/pwo.repository';
import type { StrategicImportance } from '../../../../domain/value-objects/strategic-importance.vo';
import { PrimaryWorkObject } from '../../../../domain/aggregates/primary-work-object.aggregate';
import { resolveImpactLevel, CRITICALITY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';

export class PrismaPwoRepository implements IPwoRepository {
  private readonly prisma = getPrisma();

  private async resolveUserBigInt(uuid: string): Promise<bigint | undefined> {
    const user = await this.prisma.userAccount.findUnique({
      where: { publicUuid: uuid },
      select: { id: true }
    });
    return user?.id ?? undefined;
  }

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
      description: row.description ?? undefined,
      strategicImportance: row.strategicImportanceLevel as StrategicImportance,
      revenueImpact: resolveImpactLevel(row.revenueImpactLevel, CRITICALITY_LEVELS),
      downtimeSensitivity: resolveImpactLevel(row.downtimeSensitivity, CRITICALITY_LEVELS),
      isActive: row.isActive
    });
  }

  async findByFG(fgId: string): Promise<PrimaryWorkObject[]> {
    const rows = await this.prisma.primaryWorkObject.findMany({
      where: { functionalGroupId: BigInt(fgId) }
    });
    return rows.map(row =>
      PrimaryWorkObject.reconstitute({
        id: row.id.toString(),
        tenantId: row.tenantId.toString(),
        versionId: String(row.version),
        functionalGroupId: row.functionalGroupId.toString(),
        name: row.name,
        description: row.description ?? undefined,
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
    const createdBy = pwo.createdBy ? await this.resolveUserBigInt(pwo.createdBy) : undefined;
    const updatedBy = pwo.updatedBy ? await this.resolveUserBigInt(pwo.updatedBy) : undefined;

    await this.prisma.primaryWorkObject.upsert({
      where: { id: BigInt(pwo.id) },
      update: {
        name: pwo.name,
        description: pwo.description,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive,
        ...(updatedBy !== undefined && { updatedBy })
      },
      create: {
        tenantId,
        version: Number(pwo.versionId ?? 1),
        functionalGroupId,
        name: pwo.name,
        description: pwo.description,
        strategicImportanceLevel: pwo.strategicImportance,
        revenueImpactLevel: pwo.revenueImpact.label,
        downtimeSensitivity: pwo.downtimeSensitivity.label,
        isActive: pwo.isActive,
        ...(createdBy !== undefined && { createdBy }),
        ...(updatedBy !== undefined && { updatedBy })
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
