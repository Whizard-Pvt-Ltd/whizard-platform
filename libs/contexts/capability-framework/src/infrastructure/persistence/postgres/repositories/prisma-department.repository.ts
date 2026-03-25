import { getPrisma } from '@whizard/shared-infrastructure';
import { Department } from '../../../../domain/aggregates/department.aggregate';
import type { IDepartmentRepository } from '../../../../domain/repositories/department.repository';

export class PrismaDepartmentRepository implements IDepartmentRepository {
  private readonly prisma = getPrisma();

  async findByIndustryId(tenantId: string, industryId: string): Promise<{
    id: string;
    name: string;
    industryId: string;
    fgIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]> {
    const rows = await this.prisma.department.findMany({
      where: { tenantId, industryId, isActive: true },
      include: { fgMappings: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      industryId: r.industryId,
      fgIds: r.fgMappings.map(m => m.fgId),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined
    }));
  }

  async findById(id: string): Promise<Department | null> {
    const r = await this.prisma.department.findUnique({
      where: { id },
      include: { fgMappings: true }
    });
    if (!r) return null;
    return Department.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      industryId: r.industryId,
      name: r.name,
      fgIds: r.fgMappings.map(m => m.fgId),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined,
      createdBy: r.createdBy
    });
  }

  async save(dept: Department, fgIds: string[]): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await tx.department.create({
        data: {
          id: dept.id,
          tenantId: dept.tenantId,
          industryId: dept.industryId,
          name: dept.name,
          operationalCriticalityScore: dept.operationalCriticalityScore,
          revenueContributionWeight: dept.revenueContributionWeight,
          regulatoryExposureLevel: dept.regulatoryExposureLevel,
          createdBy: dept.createdBy
        }
      });
      if (fgIds.length > 0) {
        await tx.departmentFGMapping.createMany({
          data: fgIds.map(fgId => ({ departmentId: dept.id, fgId }))
        });
      }
    });
  }

  async update(dept: Department, fgIds: string[]): Promise<void> {
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
      await tx.departmentFGMapping.deleteMany({ where: { departmentId: dept.id } });
      if (fgIds.length > 0) {
        await tx.departmentFGMapping.createMany({
          data: fgIds.map(fgId => ({ departmentId: dept.id, fgId }))
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.update({ where: { id }, data: { isActive: false } });
  }
}
