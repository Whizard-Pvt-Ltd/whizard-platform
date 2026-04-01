import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { CompanyDetailDto } from '../dto/company.dto.js';
import type { GetCompanyByIdQuery } from '../queries/get-company-by-id.query.js';
import { toCompanyDetailDto } from '../mappers/company.mapper.js';

export class GetCompanyByIdQueryHandler {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async execute(query: GetCompanyByIdQuery): Promise<CompanyDetailDto> {
    const company = await this.companyRepo.findById(query.companyId);
    if (!company) {
      throw Object.assign(new Error(`Company ${query.companyId} not found`), { name: 'DomainException' });
    }
    return toCompanyDetailDto(company, null, null);
  }
}
