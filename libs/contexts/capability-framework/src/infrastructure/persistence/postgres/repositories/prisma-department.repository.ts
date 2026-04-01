import { getPrisma } from '@whizard/shared-infrastructure';
import { Department } from '../../../../domain/aggregates/department.aggregate';
import type { IDepartmentRepository } from '../../../../domain/repositories/department.repository';

export class PrismaDepartmentRepository implements IDepartmentRepository {
  private readonly prisma = getPrisma();

  async findByIndustryId(tenantId: string, industryId: string): Promise<{
    id: string;
    name: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]> {
    const rows = await this.prisma.department.findMany({
      where: { tenantId, industryId, isActive: true },
      include: { functionalGroups: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      industryId: r.industryId ?? undefined,
      functionalGroupIds: r.functionalGroups.map(m => m.functionalGroupId),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined
    }));
  }

  async findById(id: string): Promise<Department | null> {
    const r = await this.prisma.department.findUnique({
      where: { id },
      include: { functionalGroups: true }
    });
    if (!r) return null;
    return Department.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      industryId: r.industryId ?? undefined,
      name: r.name,
      functionalGroupIds: r.functionalGroups.map(m => m.functionalGroupId),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined
    });
  }

  async save(dept: Department, functionalGroupIds: string[]): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await tx.department.create({
        data: {
          id: dept.id,
          tenantId: dept.tenantId,
          industryId: dept.industryId,
          name: dept.name,
          operationalCriticalityScore: dept.operationalCriticalityScore,
          revenueContributionWeight: dept.revenueContributionWeight,
          regulatoryExposureLevel: dept.regulatoryExposureLevel
        }
      });
      if (functionalGroupIds.length > 0) {
        await tx.departmentFunctionalGroup.createMany({
          data: functionalGroupIds.map(functionalGroupId => ({
            departmentId: dept.id,
            functionalGroupId,
            tenantId: dept.tenantId
          }))
        });
      }
    });
  }

  async update(dept: Department, functionalGroupIds: string[]): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await tx.department.update({
        where: { id: dept.id },
        data: {
          name: dept.name,
          operationalCriticalityScore: dept.operationalCriticalityScore,
          revenueContributionWeight: dept.revenueContributionWeight,
          regulatoryExposureLevel: dept.regulatoryExposureLevel
        }
      });
      await tx.departmentFunctionalGroup.deleteMany({ where: { departmentId: dept.id } });
      if (functionalGroupIds.length > 0) {
        await tx.departmentFunctionalGroup.createMany({
          data: functionalGroupIds.map(functionalGroupId => ({
            departmentId: dept.id,
            functionalGroupId,
            tenantId: dept.tenantId
          }))
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.update({ where: { id }, data: { isActive: false } });
  }
}
