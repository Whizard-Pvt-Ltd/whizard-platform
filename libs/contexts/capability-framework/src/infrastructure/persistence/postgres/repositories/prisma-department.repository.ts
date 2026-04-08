import { getPrisma } from '@whizard/shared-infrastructure';
import type { IDepartmentRepository } from '../../../../domain/repositories/department.repository';
import { Department } from '../../../../domain/aggregates/department.aggregate';

export class PrismaDepartmentRepository implements IDepartmentRepository {
  private readonly prisma = getPrisma();

  async findByTenantId(tenantId: string, industryId?: string): Promise<{
    id: string;
    name: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]> {
    const rows = await this.prisma.department.findMany({
      where: industryId
        ? { industryId: BigInt(industryId), isActive: true }
        : { tenantId: BigInt(tenantId), isActive: true },
      include: {
        functionalGroups: {
          select: { functionalGroupId: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      name: r.name,
      industryId: r.industryId?.toString() ?? undefined,
      functionalGroupIds: r.functionalGroups.map(m => m.functionalGroupId.toString()),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined
    }));
  }

  async findById(id: string): Promise<Department | null> {
    const r = await this.prisma.department.findUnique({
      where: { id: BigInt(id) },
      include: {
        functionalGroups: {
          select: { functionalGroupId: true }
        }
      }
    });
    if (!r) return null;
    return Department.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      industryId: r.industryId?.toString() ?? undefined,
      name: r.name,
      functionalGroupIds: r.functionalGroups.map(m => m.functionalGroupId.toString()),
      operationalCriticalityScore: r.operationalCriticalityScore ?? undefined,
      revenueContributionWeight: r.revenueContributionWeight ?? undefined,
      regulatoryExposureLevel: r.regulatoryExposureLevel ?? undefined
    });
  }

  async save(dept: Department, functionalGroupIds: string[]): Promise<void> {
    const tenantId = BigInt(dept.tenantId);
    const industryId = dept.industryId ? BigInt(dept.industryId) : null;

    await this.prisma.$transaction(async tx => {
      const created = await tx.department.create({
        data: {
          tenantId,
          industryId,
          name: dept.name,
          operationalCriticalityScore: dept.operationalCriticalityScore,
          revenueContributionWeight: dept.revenueContributionWeight,
          regulatoryExposureLevel: dept.regulatoryExposureLevel
        },
        select: { id: true }
      });
      if (functionalGroupIds.length > 0) {
        await tx.departmentFunctionalGroup.createMany({
          data: functionalGroupIds.map(fgId => ({
            departmentId: created.id,
            functionalGroupId: BigInt(fgId),
            tenantId
          }))
        });
      }
    });
  }

  async update(dept: Department, functionalGroupIds: string[]): Promise<void> {
    const deptRow = await this.prisma.department.findUniqueOrThrow({
      where: { id: BigInt(dept.id) },
      select: { id: true, tenantId: true }
    });
    await this.prisma.$transaction(async tx => {
      await tx.department.update({
        where: { id: deptRow.id },
        data: {
          name: dept.name,
          operationalCriticalityScore: dept.operationalCriticalityScore,
          revenueContributionWeight: dept.revenueContributionWeight,
          regulatoryExposureLevel: dept.regulatoryExposureLevel
        }
      });
      await tx.departmentFunctionalGroup.deleteMany({ where: { departmentId: deptRow.id } });
      if (functionalGroupIds.length > 0) {
        await tx.departmentFunctionalGroup.createMany({
          data: functionalGroupIds.map(fgId => ({
            departmentId: deptRow.id,
            functionalGroupId: BigInt(fgId),
            tenantId: deptRow.tenantId
          }))
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
