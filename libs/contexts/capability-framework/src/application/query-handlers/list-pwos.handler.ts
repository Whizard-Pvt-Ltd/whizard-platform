import type { IPwoRepository } from '../../domain/repositories/pwo.repository';
import type { PwoDto } from '../dto/pwo.dto';

export class ListPWOsQueryHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(fgId: string, tenantId: string): Promise<PwoDto[]> {
    const pwos = await this.pwoRepo.findByFG(fgId, tenantId);
    return pwos.filter(p => p.isActive).map(pwo => ({
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
  }
}
