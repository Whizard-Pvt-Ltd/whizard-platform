import { getPrisma } from '@whizard/shared-infrastructure';
import type { IWrcfDashboardRepository, WrcfDashboardStatsDto } from '../../../../domain/repositories/wrcf-dashboard.repository';

export class PrismaWrcfDashboardRepository implements IWrcfDashboardRepository {
  private readonly prisma = getPrisma();

  async getDashboardStats(tenantId: string, industryId: string): Promise<WrcfDashboardStatsDto> {
    const tenantBigInt = BigInt(tenantId);
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
        where: { tenantId: tenantBigInt, industryId: industryBigInt, isActive: true }
      }),
      this.prisma.primaryWorkObject.count({
        where: { tenantId: tenantBigInt, isActive: true, functionalGroup: { industryId: industryBigInt } }
      }),
      this.prisma.secondaryWorkObject.count({
        where: { tenantId: tenantBigInt, isActive: true, pwo: { functionalGroup: { industryId: industryBigInt } } }
      }),
      this.prisma.capabilityInstance.count({
        where: { tenantId: tenantBigInt, functionalGroup: { industryId: industryBigInt } }
      }),
      this.prisma.skill.count({
        where: { tenantId: tenantBigInt, isActive: true, capabilityInstance: { functionalGroup: { industryId: industryBigInt } } }
      }),
      this.prisma.task.count({
        where: { tenantId: tenantBigInt, isActive: true, skill: { capabilityInstance: { functionalGroup: { industryId: industryBigInt } } } }
      }),
      this.prisma.department.count({
        where: { tenantId: tenantBigInt, industryId: industryBigInt, isActive: true }
      }),
      this.prisma.role.count({
        where: { tenantId: tenantBigInt, isActive: true, department: { industryId: industryBigInt } }
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
