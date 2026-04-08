import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { ISwoRepository } from '../../domain/repositories/swo.repository';
import type { SwoDto } from '../dto/swo.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'secondary-work-object' });

export class ListSWOsQueryHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(pwoId: string, actorUserId?: string): Promise<SwoDto[]> {
    logger.debug('Listing SWOs', { userId: actorUserId, pwoId });
    const swos = await this.swoRepo.findByPWO(pwoId);
    const result = swos.filter(s => s.isActive).map(swo => ({
      id: swo.id,
      tenantId: swo.tenantId,
      pwoId: swo.pwoId,
      name: swo.name,
      description: swo.description,
      operationalComplexity: swo.operationalComplexity,
      assetCriticality: swo.assetCriticality,
      failureFrequency: swo.failureFrequency,
      isActive: swo.isActive
    }));
    logger.debug('Listed SWOs', { userId: actorUserId, pwoId, count: result.length });
    return result;
  }
}
