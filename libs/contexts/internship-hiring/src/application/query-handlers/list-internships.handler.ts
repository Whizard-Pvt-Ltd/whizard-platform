import type { IInternshipRepository } from '../../domain/repositories/internship.repository.js';
import type { InternshipDetailDto } from '../dto/internship.dto.js';
import type { ListInternshipsQuery } from '../queries/list-internships.query.js';
import { toInternshipDetailDto } from '../mappers/internship.mapper.js';

export class ListInternshipsQueryHandler {
  constructor(private readonly repo: IInternshipRepository) {}

  async execute(query: ListInternshipsQuery): Promise<InternshipDetailDto[]> {
    const internships = await this.repo.findAll({
      tenantId: query.tenantId,
      search:   query.search,
      status:   query.status,
    });

    const cityIds = [...new Set(internships.map(i => i.cityId).filter(Boolean) as string[])];
    const cityNameMap = new Map<string, string>();
    await Promise.all(cityIds.map(async id => {
      const name = await this.repo.findCityName(id);
      if (name) cityNameMap.set(id, name);
    }));

    return internships.map(i => toInternshipDetailDto(i, i.cityId ? (cityNameMap.get(i.cityId) ?? null) : null));
  }
}
