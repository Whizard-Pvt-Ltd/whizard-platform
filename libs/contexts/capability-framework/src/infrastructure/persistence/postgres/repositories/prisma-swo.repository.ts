import { getPrisma } from '@whizard/shared-infrastructure';
import type { SwoDto } from '../../../../application/dto/swo.dto';
import type { ISwoRepository } from '../../../../domain/repositories/swo.repository';
import { SecondaryWorkObject } from '../../../../domain/aggregates/secondary-work-object.aggregate';
import { resolveImpactLevel, CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from '../../../../domain/value-objects/impact-level.vo';

export class PrismaSwoRepository implements ISwoRepository {
  private readonly prisma = getPrisma();

  private async resolveUserBigInt(uuid: string): Promise<bigint | undefined> {
    const user = await this.prisma.userAccount.findUnique({
      where: { publicUuid: uuid },
      select: { id: true }
    });
    return user?.id ?? undefined;
  }

  async findById(id: string): Promise<SecondaryWorkObject | null> {
    const row = await this.prisma.secondaryWorkObject.findUnique({
      where: { id: BigInt(id) }
    });
    if (!row) return null;
    return SecondaryWorkObject.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      versionId: String(row.version),
      pwoId: row.pwoId.toString(),
      name: row.name,
      description: row.description ?? undefined,
      operationalComplexity: resolveImpactLevel(row.operationalComplexity, COMPLEXITY_LEVELS),
      assetCriticality: resolveImpactLevel(row.assetCriticality, CRITICALITY_LEVELS),
      failureFrequency: resolveImpactLevel(row.failureFrequency, FREQUENCY_LEVELS),
      isActive: row.isActive
    });
  }

  async findByPWOWithTenants(pwoId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<SwoDto[]> {
    const rows = await this.prisma.secondaryWorkObject.findMany({
      where: {
        pwoId: BigInt(pwoId),
        tenantId: { in: tenantIds.map(BigInt) },
        isActive: true,
      },
      orderBy: [{ tenantId: 'asc' }, { name: 'asc' }],
    });
    return rows.map(r => ({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      pwoId: r.pwoId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      operationalComplexity: resolveImpactLevel(r.operationalComplexity, COMPLEXITY_LEVELS),
      assetCriticality: resolveImpactLevel(r.assetCriticality, CRITICALITY_LEVELS),
      failureFrequency: resolveImpactLevel(r.failureFrequency, FREQUENCY_LEVELS),
      isActive: r.isActive,
      canEdit: ownedTenantIds.includes(r.tenantId.toString()),
    }));
  }

  async findByPWO(pwoId: string): Promise<SecondaryWorkObject[]> {
    const rows = await this.prisma.secondaryWorkObject.findMany({
      where: { pwoId: BigInt(pwoId) },
      orderBy: { name: 'asc' }
    });
    return rows.map(row =>
      SecondaryWorkObject.reconstitute({
        id: row.id.toString(),
        tenantId: row.tenantId.toString(),
        versionId: String(row.version),
        pwoId: row.pwoId.toString(),
        name: row.name,
        description: row.description ?? undefined,
        operationalComplexity: resolveImpactLevel(row.operationalComplexity, COMPLEXITY_LEVELS),
        assetCriticality: resolveImpactLevel(row.assetCriticality, CRITICALITY_LEVELS),
        failureFrequency: resolveImpactLevel(row.failureFrequency, FREQUENCY_LEVELS),
        isActive: row.isActive
      })
    );
  }

  async save(swo: SecondaryWorkObject): Promise<void> {
    const tenantId = BigInt(swo.tenantId);
    const pwoId = BigInt(swo.pwoId);
    const createdBy = swo.createdBy ? await this.resolveUserBigInt(swo.createdBy) : undefined;
    const updatedBy = swo.updatedBy ? await this.resolveUserBigInt(swo.updatedBy) : undefined;

    await this.prisma.secondaryWorkObject.upsert({
      where: { id: BigInt(swo.id) },
      update: {
        name: swo.name,
        description: swo.description,
        operationalComplexity: swo.operationalComplexity.label,
        assetCriticality: swo.assetCriticality.label,
        failureFrequency: swo.failureFrequency.label,
        isActive: swo.isActive,
        ...(updatedBy !== undefined && { updatedBy })
      },
      create: {
        tenantId,
        version: Number(swo.versionId ?? 1),
        pwoId,
        name: swo.name,
        description: swo.description,
        operationalComplexity: swo.operationalComplexity.label,
        assetCriticality: swo.assetCriticality.label,
        failureFrequency: swo.failureFrequency.label,
        isActive: swo.isActive,
        ...(createdBy !== undefined && { createdBy }),
        ...(updatedBy !== undefined && { updatedBy })
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secondaryWorkObject.delete({ where: { id: BigInt(id) } });
  }

  async existsByName(name: string, pwoId: string, tenantId: string): Promise<boolean> {
    const count = await this.prisma.secondaryWorkObject.count({
      where: { name, pwoId: BigInt(pwoId), tenantId: BigInt(tenantId), isActive: true }
    });
    return count > 0;
  }

  async hasCIs(swoId: string): Promise<boolean> {
    const count = await this.prisma.capabilityInstance.count({
      where: { swoId: BigInt(swoId) }
    });
    return count > 0;
  }
}
