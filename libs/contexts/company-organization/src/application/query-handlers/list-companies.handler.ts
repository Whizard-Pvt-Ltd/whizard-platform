import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { CompanyListItemDto } from '../dto/company.dto.js';
import type { ListCompaniesQuery } from '../queries/list-companies.query.js';
import { toCompanyListItemDto } from '../mappers/company.mapper.js';

export class ListCompaniesQueryHandler {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async execute(query: ListCompaniesQuery): Promise<CompanyListItemDto[]> {
    const companies = await this.companyRepo.findAll('', query.search);
    return companies.map(c => toCompanyListItemDto(c, null, null, null));
  }
}
