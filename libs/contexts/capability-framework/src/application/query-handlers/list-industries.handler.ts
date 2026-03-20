import type { IIndustryRepository } from '../../domain/repositories/industry.repository';
import type { IndustryDto } from '../dto/industry.dto';

export class ListIndustriesQueryHandler {
  constructor(private readonly industryRepo: IIndustryRepository) {}

  async execute(sectorId: string): Promise<IndustryDto[]> {
    const industries = await this.industryRepo.findBySector(sectorId);
    return industries.filter(i => i.isActive);
  }
}
