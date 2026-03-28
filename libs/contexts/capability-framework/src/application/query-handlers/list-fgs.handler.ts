import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IFunctionalGroupRepository } from '../../domain/repositories/functional-group.repository';
import type { FunctionalGroupDto } from '../dto/functional-group.dto';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'functional-group' });

export class ListFGsQueryHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(industryId: string, tenantId: string, actorUserId?: string): Promise<FunctionalGroupDto[]> {
    logger.debug('Listing functional groups', { userId: actorUserId, tenantId, industryId });
    const fgs = await this.fgRepo.findByIndustry(industryId, tenantId);
    const result = fgs.filter(fg => fg.isActive).map(fg => ({
      id: fg.id,
      tenantId: fg.tenantId,
      industryId: fg.industryId,
      name: fg.name,
      description: fg.description,
      domainType: fg.domainType,
      isActive: fg.isActive
    }));
    logger.debug('Listed functional groups', { userId: actorUserId, tenantId, industryId, count: result.length });
    return result;
  }
}
