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
    return internships.map(i => toInternshipDetailDto(i, null));
  }
}
