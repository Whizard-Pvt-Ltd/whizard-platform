export interface MediaAssetDto {
  id: string;
  name: string;
  url: string;
  key: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailUrl: string | null;
}

export interface CompanyMediaItemDto {
  mediaAssetId: string;
  mediaRole: string;
  sortOrder: number;
  asset: MediaAssetDto | null;
}

export interface CompanyContactDto {
  userId: string;
  contactRole: string;
  userName?: string;
  userEmail?: string;
}

export interface CompanyClubDto {
  clubId: string;
  isParent: boolean;
  name?: string;
  logoUrl?: string | null;
}

export interface CompanyServiceDto {
  id: string;
  category: string;
  description: string | null;
}

export interface CompanyProductDto {
  id: string;
  name: string;
  description: string | null;
}

export interface CompanyHiringStatDto {
  year: number;
  hires: number | null;
  internshipConversionRate: number | null;
}

export interface CompanyHiringRoleDto {
  id: string;
  roleName: string;
}

export interface CompanyHiringDomainDto {
  id: string;
  domain: string;
}

export interface CompanyCompensationStatDto {
  year: number;
  highestPackage: number | null;
  averagePackage: number | null;
}

export interface CompanyListItemDto {
  id: string;
  companyCode: string;
  name: string;
  cityName: string | null;
  companyType: string | null;
  establishedYear: number | null;
  industryName: string | null;
  status: number;
  logoUrl: string | null;
}

export interface CompanyDetailDto extends CompanyListItemDto {
  tenantId: string;
  industryId: string | null;
  cityId: string | null;
  description: string | null;
  whatWeOffer: string | null;
  awardsRecognition: string | null;
  keyProductsServices: string | null;
  recruitmentHighlights: string | null;
  placementStats: string | null;
  inquiryEmail: string | null;
  clubs: CompanyClubDto[];
  mediaItems: CompanyMediaItemDto[];
  contacts: CompanyContactDto[];
  services: CompanyServiceDto[];
  products: CompanyProductDto[];
  hiringStats: CompanyHiringStatDto[];
  hiringRoles: CompanyHiringRoleDto[];
  hiringDomains: CompanyHiringDomainDto[];
  compensationStats: CompanyCompensationStatDto[];
}

export interface ClubDto {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface IndustryDto {
  id: string;
  name: string;
  sectorName: string;
}

export interface CityDto {
  id: string;
  name: string;
  state: string;
}

export interface UserContactDto {
  id: string;
  primaryEmail: string;
}
