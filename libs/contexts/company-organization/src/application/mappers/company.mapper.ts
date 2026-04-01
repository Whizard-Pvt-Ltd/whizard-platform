import type { Company } from '../../domain/aggregates/company.aggregate.js';
import type { CompanyDetailDto, CompanyListItemDto } from '../dto/company.dto.js';

export function toCompanyListItemDto(company: Company, logoUrl: string | null, cityName: string | null, industryName: string | null): CompanyListItemDto {
  return {
    id: company.id,
    companyCode: company.companyCode,
    name: company.name,
    cityName,
    companyType: company.companyType,
    establishedYear: company.establishedYear,
    industryName,
    status: company.status,
    logoUrl,
  };
}

export function toCompanyDetailDto(
  company: Company,
  cityName: string | null,
  industryName: string | null,
  extras: {
    services?: Array<{ id: string; category: string; description: string | null }>;
    products?: Array<{ id: string; name: string; description: string | null }>;
    hiringStats?: Array<{ year: number; hires: number | null; internshipConversionRate: number | null }>;
    hiringRoles?: Array<{ id: string; roleName: string }>;
    hiringDomains?: Array<{ id: string; domain: string }>;
    compensationStats?: Array<{ year: number; highestPackage: number | null; averagePackage: number | null }>;
  } = {}
): CompanyDetailDto {
  return {
    id: company.id,
    tenantId: company.tenantId,
    companyCode: company.companyCode,
    name: company.name,
    industryId: company.industryId,
    industryName,
    cityId: company.cityId,
    cityName,
    companyType: company.companyType,
    establishedYear: company.establishedYear,
    status: company.status,
    logoUrl: company.mediaItems.find(m => m.mediaRole === 'logo')?.mediaAssetId ?? null,
    description: company.description,
    whatWeOffer: company.whatWeOffer,
    awardsRecognition: company.awardsRecognition,
    keyProductsServices: company.keyProductsServices,
    recruitmentHighlights: company.recruitmentHighlights,
    placementStats: company.placementStats,
    inquiryEmail: company.inquiryEmail,
    clubs: company.clubs.map(c => ({ clubId: c.clubId, isParent: c.isParent })),
    mediaItems: company.mediaItems.map(m => ({ mediaAssetId: m.mediaAssetId, mediaRole: m.mediaRole, sortOrder: m.sortOrder, asset: null })),
    contacts: company.contacts.map(c => ({ userId: c.userId, contactRole: c.role })),
    services: extras.services ?? [],
    products: extras.products ?? [],
    hiringStats: extras.hiringStats ?? [],
    hiringRoles: extras.hiringRoles ?? [],
    hiringDomains: extras.hiringDomains ?? [],
    compensationStats: extras.compensationStats ?? [],
  };
}
