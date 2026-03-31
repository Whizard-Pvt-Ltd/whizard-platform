import { getPrisma } from '@whizard/shared-infrastructure';
import type { ISwoRepository } from '../../../../domain/repositories/swo.repository';
import { SecondaryWorkObject } from '../../../../domain/aggregates/secondary-work-object.aggregate';
import { resolveImpactLevel, CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';

export class PrismaSwoRepository implements ISwoRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<SecondaryWorkObject | null> {
    const row = await this.prisma.secondaryWorkObject.findUnique({ where: { id } });
    if (!row) return null;
    return SecondaryWorkObject.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      versionId: String(row.version),
      pwoId: row.pwoId,
      name: row.name,
      operationalComplexity: resolveImpactLevel(row.operationalComplexity, COMPLEXITY_LEVELS),
      assetCriticality: resolveImpactLevel(row.assetCriticality, CRITICALITY_LEVELS),
      failureFrequency: resolveImpactLevel(row.failureFrequency, FREQUENCY_LEVELS),
      isActive: row.isActive
    });
  }

  async findByPWO(pwoId: string, tenantId: string): Promise<SecondaryWorkObject[]> {
    const rows = await this.prisma.secondaryWorkObject.findMany({
      where: { pwoId, tenantId }
    });
    return rows.map(row =>
      SecondaryWorkObject.reconstitute({
        id: row.id,
        tenantId: row.tenantId,
        versionId: String(row.version),
        pwoId: row.pwoId,
        name: row.name,
        operationalComplexity: resolveImpactLevel(row.operationalComplexity, COMPLEXITY_LEVELS),
        assetCriticality: resolveImpactLevel(row.assetCriticality, CRITICALITY_LEVELS),
        failureFrequency: resolveImpactLevel(row.failureFrequency, FREQUENCY_LEVELS),
        isActive: row.isActive
      })
    );
  }

  async save(swo: SecondaryWorkObject): Promise<void> {
    await this.prisma.secondaryWorkObject.upsert({
      where: { id: swo.id },
      update: {
        name: swo.name,
        operationalComplexity: swo.operationalComplexity.label,
        assetCriticality: swo.assetCriticality.label,
        failureFrequency: swo.failureFrequency.label,
        isActive: swo.isActive
      },
      create: {
        id: swo.id,
        tenantId: swo.tenantId,
        version: Number(swo.versionId ?? 1),
        pwoId: swo.pwoId,
        name: swo.name,
        operationalComplexity: swo.operationalComplexity.label,
        assetCriticality: swo.assetCriticality.label,
        failureFrequency: swo.failureFrequency.label,
        isActive: swo.isActive
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secondaryWorkObject.delete({ where: { id } });
  }
}
