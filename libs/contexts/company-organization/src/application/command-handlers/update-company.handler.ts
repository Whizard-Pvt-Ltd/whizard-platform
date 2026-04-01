import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { UpdateCompanyCommand } from '../commands/update-company.command.js';
import type { CompanyDetailDto } from '../dto/company.dto.js';
import { toCompanyDetailDto } from '../mappers/company.mapper.js';

export class UpdateCompanyCommandHandler {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async execute(cmd: UpdateCompanyCommand): Promise<CompanyDetailDto> {
    const company = await this.companyRepo.findById(cmd.companyId);
    if (!company) {
      throw Object.assign(new Error(`Company ${cmd.companyId} not found`), { name: 'DomainException' });
    }

    if (cmd.name && cmd.name !== company.name) {
      const nameExists = await this.companyRepo.existsByName(cmd.name, cmd.companyId);
      if (nameExists) {
        throw Object.assign(new Error(`Company with name "${cmd.name}" already exists`), { name: 'DomainException' });
      }
    }

    company.update({
      name: cmd.name,
      industryId: cmd.industryId,
      cityId: cmd.cityId,
      companyType: cmd.companyType,
      establishedYear: cmd.establishedYear,
      description: cmd.description,
      whatWeOffer: cmd.whatWeOffer,
      awardsRecognition: cmd.awardsRecognition,
      keyProductsServices: cmd.keyProductsServices,
      recruitmentHighlights: cmd.recruitmentHighlights,
      placementStats: cmd.placementStats,
      inquiryEmail: cmd.inquiryEmail,
      clubs: cmd.clubs,
      mediaItems: cmd.mediaItems,
      contacts: cmd.contacts,
    });

    await this.companyRepo.save(company);
    return toCompanyDetailDto(company, null, null);
  }
}
