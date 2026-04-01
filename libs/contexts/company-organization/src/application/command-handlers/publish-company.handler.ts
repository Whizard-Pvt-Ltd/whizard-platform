import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { PublishCompanyCommand } from '../commands/publish-company.command.js';
import type { CompanyDetailDto } from '../dto/company.dto.js';
import { toCompanyDetailDto } from '../mappers/company.mapper.js';

export class PublishCompanyCommandHandler {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async execute(cmd: PublishCompanyCommand): Promise<CompanyDetailDto> {
    const company = await this.companyRepo.findById(cmd.companyId);
    if (!company) {
      throw Object.assign(new Error(`Company ${cmd.companyId} not found`), { name: 'DomainException' });
    }

    if (!company.isMandatoryComplete()) {
      throw Object.assign(new Error('Cannot publish: mandatory fields (name, industry, city) are incomplete'), { name: 'DomainException' });
    }

    company.publish();
    await this.companyRepo.save(company);
    return toCompanyDetailDto(company, null, null);
  }
}
