import type { ISwoRepository } from '../../domain/repositories/swo.repository';
import type { SwoDto } from '../dto/swo.dto';

export class ListSWOsQueryHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(pwoId: string, tenantId: string): Promise<SwoDto[]> {
    const swos = await this.swoRepo.findByPWO(pwoId, tenantId);
    return swos.filter(s => s.isActive).map(swo => ({
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
  }
}
