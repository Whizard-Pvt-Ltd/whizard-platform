import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { ISwoRepository } from '../../domain/repositories/swo.repository';
import type { SwoDto } from '../dto/swo.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'secondary-work-object' });

export class ListSWOsQueryHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(pwoId: string, tenantIds: string[], ownedTenantIds: string[], actorUserId?: string): Promise<SwoDto[]> {
    logger.debug('Listing SWOs', { userId: actorUserId, pwoId, tenantIds });
    const result = await this.swoRepo.findByPWOWithTenants(pwoId, tenantIds, ownedTenantIds);
    logger.debug('Listed SWOs', { userId: actorUserId, pwoId, count: result.length });
    return result;
  }
}
