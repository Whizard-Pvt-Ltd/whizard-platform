import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IPwoRepository } from '../../domain/repositories/pwo.repository';
import type { PwoDto } from '../dto/pwo.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'primary-work-object' });

export class ListPWOsQueryHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(fgId: string, tenantIds: string[], ownedTenantIds: string[], actorUserId?: string): Promise<PwoDto[]> {
    logger.debug('Listing PWOs', { userId: actorUserId, fgId, tenantIds });
    const result = await this.pwoRepo.findByFGWithTenants(fgId, tenantIds, ownedTenantIds);
    logger.debug('Listed PWOs', { userId: actorUserId, fgId, count: result.length });
    return result;
  }
}
