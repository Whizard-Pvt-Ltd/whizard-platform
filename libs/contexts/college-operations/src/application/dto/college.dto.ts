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

export interface CollegeMediaItemDto {
  mediaAssetId: string;
  mediaRole: string;
  sortOrder: number;
  asset: MediaAssetDto | null;
}

export interface CollegeContactDto {
  userId: string;
  role: string;
  userName?: string;
  userEmail?: string;
}

export interface CollegeListItemDto {
  id: string;
  collegeCode: string;
  name: string;
  affiliatedUniversity: string;
  cityName: string | null;
  collegeType: string;
  establishedYear: number | null;
  status: number;
  logoUrl: string | null;
}

export interface CollegeDetailDto extends CollegeListItemDto {
  tenantId: string;
  cityId: string | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  clubIds: string[];
  programIds: string[];
  mediaItems: CollegeMediaItemDto[];
  contacts: CollegeContactDto[];
}

export interface ClubDto {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface SpecializationDto {
  id: string;
  name: string;
}

export interface DegreeProgramDto {
  id: string;
  name: string;
  level: string;
  durationYears: number | null;
  specializations: SpecializationDto[];
}

export interface CityDto {
  id: string;
  name: string;
  state: string;
}

export interface UserContactDto {
  id: string;
  primaryEmail: string;
  displayName: string;
}
