export interface CompanyListItem {
  id: string;
  companyCode: string;
  name: string;
  industryName: string | null;
  cityName: string | null;
  companyType: string | null;
  establishedYear: number | null;
  status: number;
  logoUrl: string | null;
}

export interface CompanyClubItem {
  clubId: string;
  clubName: string | null;
  isParent: boolean;
}

export interface CompanyMediaItem {
  mediaAssetId: string;
  mediaRole: string;
  sortOrder: number;
  asset: MediaAsset | null;
}

export interface CompanyContact {
  userId: string;
  role: string;
  userName?: string;
  userEmail?: string;
}

export interface CompanyDetail extends CompanyListItem {
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
  clubs: CompanyClubItem[];
  contacts: CompanyContact[];
  mediaItems: CompanyMediaItem[];
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  key: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailUrl: string | null;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface City {
  id: string;
  name: string;
  state: string | null;
}

export interface UserContact {
  id: string;
  primaryEmail: string;
  displayName: string;
}

export interface CompanyFormValue {
  name: string;
  industryId: string | null;
  cityId: string | null;
  companyType: string | null;
  establishedYear: number | null;
  description: string | null;
  whatWeOffer: string | null;
  awardsRecognition: string | null;
  keyProductsServices: string | null;
  recruitmentHighlights: string | null;
  placementStats: string | null;
  inquiryEmail: string | null;
  parentClubId: string | null;
  associatedClubId: string | null;
  contacts: CompanyContact[];
  mediaItems: { mediaAssetId: string; mediaRole: string; sortOrder: number }[];
}

export type PageMode = 'list' | 'create' | 'edit' | 'preview';

export const COMPANY_TYPES = ['Private', 'Public', 'MNC', 'Startup', 'NGO'] as const;

export const COMPANY_CONTACT_ROLES = [
  { value: 'HR_COORDINATOR',            label: 'HR Coordinators',           multi: true },
  { value: 'COMMUNICATION_COORDINATOR', label: 'Communication Coordinator', multi: false },
  { value: 'RECRUITMENT_HEAD',          label: 'Recruitment Head',          multi: false },
  { value: 'TRAINING_COORDINATOR',      label: 'Training Coordinator',      multi: false },
  { value: 'INTERNSHIP_MENTOR',         label: 'Internship Mentor',         multi: false },
] as const;
