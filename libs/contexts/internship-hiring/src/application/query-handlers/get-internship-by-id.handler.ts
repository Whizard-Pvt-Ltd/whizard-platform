import type { IInternshipRepository } from '../../domain/repositories/internship.repository.js';
import type { InternshipDetailDto } from '../dto/internship.dto.js';
import type { GetInternshipByIdQuery } from '../queries/get-internship-by-id.query.js';
import { InternshipNotFoundException } from '../../domain/exceptions/internship-not-found.exception.js';
import { toInternshipDetailDto } from '../mappers/internship.mapper.js';

export class GetInternshipByIdQueryHandler {
  constructor(private readonly repo: IInternshipRepository) {}

  async execute(query: GetInternshipByIdQuery): Promise<InternshipDetailDto> {
    const internship = await this.repo.findById(query.id);
    if (!internship) throw new InternshipNotFoundException(query.id);
    const cityName = internship.cityId ? await this.repo.findCityName(internship.cityId) : null;
    return toInternshipDetailDto(internship, cityName);
  }
}
