import type { College } from '../../domain/aggregates/college.aggregate.js';
import type { CollegeDetailDto, CollegeListItemDto } from '../dto/college.dto.js';

export function toCollegeListItemDto(college: College, logoUrl: string | null, cityName: string | null): CollegeListItemDto {
  return {
    id: college.id,
    collegeCode: college.collegeCode,
    name: college.name,
    affiliatedUniversity: college.affiliatedUniversity,
    cityName,
    collegeType: college.collegeType,
    establishedYear: college.establishedYear,
    status: college.status,
    logoUrl,
  };
}

export function toCollegeDetailDto(
  college: College,
  cityName: string | null,
  userMap?: Map<string, { displayName: string; email: string }>,
): CollegeDetailDto {
  return {
    id: college.id,
    tenantId: college.tenantId,
    collegeCode: college.collegeCode,
    name: college.name,
    affiliatedUniversity: college.affiliatedUniversity,
    cityId: college.cityId,
    cityName,
    collegeType: college.collegeType,
    establishedYear: college.establishedYear,
    status: college.status,
    logoUrl: college.mediaItems.find(m => m.mediaRole === 'logo')?.mediaAssetId ?? null,
    description: college.description,
    degreesOffered: college.degreesOffered,
    placementHighlights: college.placementHighlights,
    inquiryEmail: college.inquiryEmail,
    clubIds: college.clubIds,
    programIds: college.programIds,
    mediaItems: college.mediaItems.map(m => ({ mediaAssetId: m.mediaAssetId, mediaRole: m.mediaRole, sortOrder: m.sortOrder, asset: null })),
    contacts: college.contacts.map(c => {
      const user = userMap?.get(c.userId);
      return { userId: c.userId, role: c.role, userName: user?.displayName, userEmail: user?.email };
    }),
  };
}
