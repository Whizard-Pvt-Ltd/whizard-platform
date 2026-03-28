import { getPrisma } from '@whizard/shared-infrastructure';
import type { IFunctionalGroupRepository } from '../../../../domain/repositories/functional-group.repository';
import type { DomainType } from '../../../../domain/value-objects/domain-type.vo';
import { FunctionalGroup } from '../../../../domain/aggregates/functional-group.aggregate';

export class PrismaFunctionalGroupRepository implements IFunctionalGroupRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<FunctionalGroup | null> {
    const row = await this.prisma.functionalGroup.findUnique({ where: { id } });
    if (!row) return null;
    return FunctionalGroup.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      versionId: row.versionId ?? undefined,
      industryId: row.industryId,
      name: row.name,
      description: row.description ?? undefined,
      domainType: row.domainType as DomainType,
      isActive: row.isActive
    });
  }

  async findByIndustry(industryId: string, tenantId: string): Promise<FunctionalGroup[]> {
    const rows = await this.prisma.functionalGroup.findMany({
      where: { industryId, tenantId }
    });
    return rows.map(row =>
      FunctionalGroup.reconstitute({
        id: row.id,
        tenantId: row.tenantId,
        versionId: row.versionId ?? undefined,
        industryId: row.industryId,
        name: row.name,
        description: row.description ?? undefined,
        domainType: row.domainType as DomainType,
        isActive: row.isActive
      })
    );
  }

  async save(fg: FunctionalGroup): Promise<void> {
    await this.prisma.functionalGroup.upsert({
      where: { id: fg.id },
      update: {
        name: fg.name,
        description: fg.description,
        domainType: fg.domainType,
        isActive: fg.isActive
      },
      create: {
        id: fg.id,
        tenantId: fg.tenantId,
        versionId: fg.versionId,
        industryId: fg.industryId,
        name: fg.name,
        description: fg.description,
        domainType: fg.domainType,
        isActive: fg.isActive
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.functionalGroup.delete({ where: { id } });
  }

  async hasPWOs(fgId: string): Promise<boolean> {
    const count = await this.prisma.primaryWorkObject.count({
      where: { functionalGroupId: fgId, isActive: true }
    });
    return count > 0;
  }
}
