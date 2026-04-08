import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IPwoRepository } from '../../domain/repositories/pwo.repository';
import type { PwoDto } from '../dto/pwo.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'primary-work-object' });

export class ListPWOsQueryHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(fgId: string, actorUserId?: string): Promise<PwoDto[]> {
    logger.debug('Listing PWOs', { userId: actorUserId, fgId });
    const pwos = await this.pwoRepo.findByFG(fgId);
    const result = pwos.filter(p => p.isActive).map(pwo => ({
      id: pwo.id,
      tenantId: pwo.tenantId,
      functionalGroupId: pwo.functionalGroupId,
      name: pwo.name,
      description: pwo.description,
      strategicImportance: pwo.strategicImportance,
      revenueImpact: pwo.revenueImpact,
      downtimeSensitivity: pwo.downtimeSensitivity,
      isActive: pwo.isActive
    }));
    logger.debug('Listed PWOs', { userId: actorUserId, fgId, count: result.length });
    return result;
  }
}
