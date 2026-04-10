import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IFunctionalGroupRepository } from '../../domain/repositories/functional-group.repository';
import type { FunctionalGroupDto } from '../dto/functional-group.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'functional-group' });

export class ListFGsQueryHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(industryId: string, tenantIds: string[], ownedTenantIds: string[], actorUserId?: string): Promise<FunctionalGroupDto[]> {
    logger.debug('Listing functional groups', { userId: actorUserId, tenantIds, industryId });
    const result = await this.fgRepo.findByIndustryWithTenants(industryId, tenantIds, ownedTenantIds);
    logger.debug('Listed functional groups', { userId: actorUserId, industryId, count: result.length });
    return result;
  }
}
