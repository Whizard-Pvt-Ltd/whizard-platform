export interface CollegeListItem {
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

export interface CollegeMediaItem {
  mediaAssetId: string;
  mediaRole: string;
  sortOrder: number;
  asset: MediaAsset | null;
}

export interface CollegeContact {
  userId: string;
  role: string;
  userName?: string;
  userEmail?: string;
}

export interface CollegeDetail extends CollegeListItem {
  tenantId: string;
  cityId: string | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  clubIds: string[];
  programIds: string[];
  mediaItems: CollegeMediaItem[];
  contacts: CollegeContact[];
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

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface Specialization {
  id: string;
  name: string;
}

export interface DegreeProgram {
  id: string;
  name: string;
  level: string;
  durationYears: number | null;
  specializations: Specialization[];
}

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface UserContact {
  id: string;
  primaryEmail: string;
  displayName: string;
}

export interface CollegeFormValue {
  name: string;
  affiliatedUniversity: string;
  cityId: string | null;
  cityName: string | null;
  collegeType: string;
  establishedYear: number | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  clubIds: string[];
  programIds: string[];
  contacts: CollegeContact[];
}

export type PageMode = 'list' | 'create' | 'edit' | 'preview';

export const COLLEGE_TYPES = ['Private', 'Public', 'Deemed', 'Autonomous'] as const;
export const CONTACT_ROLES = [
  { value: 'VICE_CHANCELLOR',       label: 'Vice Chancellor' },
  { value: 'GROOM_COORDINATOR',     label: 'College Groom Coordinator' },
  { value: 'COORDINATOR',           label: 'College Communication Coordinator' },
  { value: 'PLACEMENT_HEAD',        label: 'Placement Head' },
  { value: 'PLACEMENT_COORDINATOR', label: 'Placement Coordinator' },
] as const;
