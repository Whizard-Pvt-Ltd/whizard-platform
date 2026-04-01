import type { CollegeMediaItem, CollegeContactItem } from '../../domain/aggregates/college.aggregate.js';

export interface UpdateCollegeCommand {
  actorUserId: string;
  tenantId: string;
  collegeId: string;
  name?: string;
  affiliatedUniversity?: string;
  cityId?: string | null;
  collegeType?: string;
  establishedYear?: number | null;
  description?: string | null;
  degreesOffered?: string | null;
  placementHighlights?: string | null;
  inquiryEmail?: string | null;
  clubIds?: string[];
  programIds?: string[];
  mediaItems?: CollegeMediaItem[];
  contacts?: CollegeContactItem[];
}
