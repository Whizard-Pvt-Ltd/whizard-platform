import type { IFunctionalGroupRepository } from '../../domain/repositories/functional-group.repository';
import type { FunctionalGroupDto } from '../dto/functional-group.dto';

export class ListFGsQueryHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(industryId: string, tenantId: string): Promise<FunctionalGroupDto[]> {
    const fgs = await this.fgRepo.findByIndustry(industryId, tenantId);
    return fgs.filter(fg => fg.isActive).map(fg => ({
      id: fg.id,
      tenantId: fg.tenantId,
      industryId: fg.industryId,
      name: fg.name,
      description: fg.description,
      domainType: fg.domainType,
      isActive: fg.isActive
    }));
  }
}
