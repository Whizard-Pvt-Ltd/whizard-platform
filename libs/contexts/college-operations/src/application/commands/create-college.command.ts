export interface CreateCollegeCommand {
  actorUserId: string;
  tenantId: string;
  name: string;
  affiliatedUniversity: string;
  cityId: string | null;
  cityCode: string | null;
  collegeType: string;
  establishedYear: number | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  clubIds: string[];
  programIds: string[];
}
