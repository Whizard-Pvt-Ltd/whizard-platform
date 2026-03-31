import { getPrisma } from '@whizard/shared-infrastructure';
import type { IWrcfDashboardRepository, WrcfDashboardStatsDto } from '../../../../domain/repositories/wrcf-dashboard.repository';

export class PrismaWrcfDashboardRepository implements IWrcfDashboardRepository {
  private readonly prisma = getPrisma();

  async getDashboardStats(tenantId: string, industryId: string): Promise<WrcfDashboardStatsDto> {
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
        where: { tenantId, industryId, isActive: true }
      }),
      this.prisma.primaryWorkObject.count({
        where: { tenantId, isActive: true, functionalGroup: { industryId } }
      }),
      this.prisma.secondaryWorkObject.count({
        where: { tenantId, isActive: true, pwo: { functionalGroup: { industryId } } }
      }),
      this.prisma.capabilityInstance.count({
        where: { tenantId, functionalGroup: { industryId } }
      }),
      this.prisma.skill.count({
        where: { tenantId, isActive: true, capabilityInstance: { functionalGroup: { industryId } } }
      }),
      this.prisma.task.count({
        where: { tenantId, isActive: true, skill: { capabilityInstance: { functionalGroup: { industryId } } } }
      }),
      this.prisma.department.count({
        where: { tenantId, industryId, isActive: true }
      }),
      this.prisma.role.count({
        where: { tenantId, isActive: true, department: { industryId } }
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
