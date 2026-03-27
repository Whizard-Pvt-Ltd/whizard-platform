import type { IWrcfDashboardRepository, WrcfDashboardStatsDto } from '../../domain/repositories/wrcf-dashboard.repository';
import { getOrCreateAppLogger } from '@whizard/shared-logging';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'wrcf-dashboard' });

export class GetDashboardStatsQueryHandler {
  constructor(private readonly repo: IWrcfDashboardRepository) {}

  async execute(tenantId: string, industryId: string, actorUserId?: string): Promise<WrcfDashboardStatsDto> {
    logger.debug('Getting dashboard stats', { userId: actorUserId, tenantId, industryId });
    const stats = await this.repo.getDashboardStats(tenantId, industryId);
    logger.debug('Got dashboard stats', { userId: actorUserId, tenantId, industryId });
    return stats;
  }
}
