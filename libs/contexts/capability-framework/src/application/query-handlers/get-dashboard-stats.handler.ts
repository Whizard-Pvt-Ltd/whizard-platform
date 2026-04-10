import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IWrcfDashboardRepository, WrcfDashboardStatsDto } from '../../domain/repositories/wrcf-dashboard.repository';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'wrcf-dashboard' });

export class GetDashboardStatsQueryHandler {
  constructor(private readonly repo: IWrcfDashboardRepository) {}

  async execute(industryId: string, tenantIds: string[], actorUserId?: string): Promise<WrcfDashboardStatsDto> {
    logger.debug('Getting dashboard stats', { userId: actorUserId, tenantIds, industryId });
    const stats = await this.repo.getDashboardStats(tenantIds, industryId);
    logger.debug('Got dashboard stats', { userId: actorUserId, tenantIds, industryId });
    return stats;
  }
}
