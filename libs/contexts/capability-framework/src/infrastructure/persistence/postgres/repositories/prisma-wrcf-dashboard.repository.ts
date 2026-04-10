import { getPrisma } from '@whizard/shared-infrastructure';
import type { IWrcfDashboardRepository, WrcfDashboardStatsDto } from '../../../../domain/repositories/wrcf-dashboard.repository';

export class PrismaWrcfDashboardRepository implements IWrcfDashboardRepository {
  private readonly prisma = getPrisma();

  async getDashboardStats(tenantIds: string[], industryId: string): Promise<WrcfDashboardStatsDto> {
    const tenantBigInts = tenantIds.map(BigInt);
    const industryBigInt = BigInt(industryId);

    const [
      functionalGroups,
      primaryWorkObjects,
      secondaryWorkObjects,
      capabilityInstances,
      skills,
      tasks,
      departments,
      roles
    ] = await Promise.all([
      this.prisma.functionalGroup.count({
        where: { tenantId: { in: tenantBigInts }, industryId: industryBigInt, isActive: true }
      }),
      this.prisma.primaryWorkObject.count({
        where: { tenantId: { in: tenantBigInts }, isActive: true, functionalGroup: { industryId: industryBigInt } }
      }),
      this.prisma.secondaryWorkObject.count({
        where: { tenantId: { in: tenantBigInts }, isActive: true, pwo: { functionalGroup: { industryId: industryBigInt } } }
      }),
      this.prisma.capabilityInstance.count({
        where: { tenantId: { in: tenantBigInts }, functionalGroup: { industryId: industryBigInt } }
      }),
      this.prisma.skill.count({
        where: { tenantId: { in: tenantBigInts }, isActive: true, capabilityInstance: { functionalGroup: { industryId: industryBigInt } } }
      }),
      this.prisma.task.count({
        where: { tenantId: { in: tenantBigInts }, isActive: true, skill: { capabilityInstance: { functionalGroup: { industryId: industryBigInt } } } }
      }),
      this.prisma.department.count({
        where: { tenantId: { in: tenantBigInts }, industryId: industryBigInt, isActive: true }
      }),
      this.prisma.role.count({
        where: { tenantId: { in: tenantBigInts }, isActive: true, department: { industryId: industryBigInt } }
      })
    ]);

    return {
      functionalGroups,
      primaryWorkObjects,
      secondaryWorkObjects,
      capabilityInstances,
      skills,
      tasks,
      departments,
      roles
    };
  }
}
