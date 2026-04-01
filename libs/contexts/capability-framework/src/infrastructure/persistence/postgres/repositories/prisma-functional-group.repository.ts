import { getPrisma } from '@whizard/shared-infrastructure';
import type { IFunctionalGroupRepository } from '../../../../domain/repositories/functional-group.repository';
import type { DomainType } from '../../../../domain/value-objects/domain-type.vo';
import { FunctionalGroup } from '../../../../domain/aggregates/functional-group.aggregate';

export class PrismaFunctionalGroupRepository implements IFunctionalGroupRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<FunctionalGroup | null> {
    const row = await this.prisma.functionalGroup.findUnique({
      where: { id: BigInt(id) }
    });
    if (!row) return null;
    return FunctionalGroup.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      versionId: String(row.version) ?? undefined,
      industryId: row.industryId.toString(),
      name: row.name,
      description: row.description ?? undefined,
      domainType: row.domainType as DomainType,
      isActive: row.isActive
    });
  }

  async findByIndustry(industryId: string, tenantId: string): Promise<FunctionalGroup[]> {
    const rows = await this.prisma.functionalGroup.findMany({
      where: {
        industryId: BigInt(industryId),
        tenantId: BigInt(tenantId)
      }
    });
    return rows.map(row =>
      FunctionalGroup.reconstitute({
        id: row.id.toString(),
        tenantId: row.tenantId.toString(),
        versionId: String(row.version) ?? undefined,
        industryId: row.industryId.toString(),
        name: row.name,
        description: row.description ?? undefined,
        domainType: row.domainType as DomainType,
        isActive: row.isActive
      })
    );
  }

  async save(fg: FunctionalGroup): Promise<void> {
    const tenantId = BigInt(fg.tenantId);
    const industryId = BigInt(fg.industryId);

    await this.prisma.functionalGroup.upsert({
      where: { id: BigInt(fg.id) },
      update: {
        name: fg.name,
        description: fg.description,
        domainType: fg.domainType,
        isActive: fg.isActive
      },
      create: {
        tenantId,
        version: Number(fg.versionId ?? 1),
        industryId,
        name: fg.name,
        description: fg.description,
        domainType: fg.domainType,
        isActive: fg.isActive
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.functionalGroup.delete({ where: { id: BigInt(id) } });
  }

  async hasPWOs(fgId: string): Promise<boolean> {
    const count = await this.prisma.primaryWorkObject.count({
      where: { functionalGroupId: BigInt(fgId), isActive: true }
    });
    return count > 0;
  }
}
