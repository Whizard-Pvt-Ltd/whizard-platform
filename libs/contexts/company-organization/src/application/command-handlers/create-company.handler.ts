import { randomUUID } from 'crypto';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { CreateCompanyCommand } from '../commands/create-company.command.js';
import type { CompanyDetailDto } from '../dto/company.dto.js';
import { Company } from '../../domain/aggregates/company.aggregate.js';
import { toCompanyDetailDto } from '../mappers/company.mapper.js';

export class CreateCompanyCommandHandler {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async execute(cmd: CreateCompanyCommand): Promise<CompanyDetailDto> {
    const nameExists = await this.companyRepo.existsByName(cmd.name);
    if (nameExists) {
      throw Object.assign(new Error(`Company with name "${cmd.name}" already exists`), { name: 'DomainException' });
    }

    const tenantId   = randomUUID();
    const companyId  = randomUUID();
    const companyCode = `CMP-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const company = Company.create({
      id: companyId,
      tenantId,
      industryId: cmd.industryId,
      companyCode,
      name: cmd.name,
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
      isActive: true,
      createdBy: cmd.actorUserId,
      clubs: [],
      mediaItems: [],
      contacts: [],
    });

    await this.companyRepo.save(company);
    return toCompanyDetailDto(company, null, null);
  }
}
