import type {
  ScreeningQuestion,
  EligibilityCheck,
  AssessmentItem,
  InterviewRubric,
  WeeklyScheduleEntry,
  FileItem,
  InternshipBatchProps,
} from '../../domain/aggregates/internship.aggregate.js';

export interface InternshipListItemDto {
  id: string;
  title: string;
  bannerImageUrl: string | null;
  cityName: string | null;
  vacancies: number;
  stipend: number | null;
  durationMonths: number;
  applicationDeadline: string | null;
  internshipType: string;
  status: string;
}

export interface InternshipDetailDto {
  id: string;
  tenantId: string;
  title: string;
  bannerImageUrl: string | null;
  vacancies: number;
  cityId: string | null;
  cityName: string | null;
  stipend: number | null;
  durationMonths: number;
  applicationDeadline: string | null;
  internshipType: string;
  status: string;
  internshipDetail: string | null;
  roleOverview: string | null;
  keyResponsibilities: string | null;
  eligibilityRequirements: string | null;
  timelineWorkSchedule: string | null;
  perksAndBenefits: string | null;
  selectionProcess: string | null;
  contactInformation: string | null;
  screeningQuestions: ScreeningQuestion[];
  eligibilityCheck: EligibilityCheck | null;
  assessments: AssessmentItem[];
  interviewRubric: InterviewRubric | null;
  offerLetterTemplateUrl: string | null;
  termsConditionUrl: string | null;
  offerLetterReleaseMethod: string | null;
  functionalGroupId: string | null;
  preInternshipCommunication: string | null;
  preReadCourses: FileItem[];
  preReadArticles: FileItem[];
  batches: InternshipBatchProps[];
  totalWeeks: number | null;
  weeklySchedule: WeeklyScheduleEntry[];
  midTermFeedbackDate: string | null;
  finalSubmissionDocuments: string[];
  documentGuidelines: string | null;
  presentationRubricUrl: string | null;
  minPresentationScore: number | null;
  presentationWeightage: number | null;
  certificateTemplateUrl: string | null;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
}

export interface CreateInternshipDto {
  actorUserId: string;
  tenantId: string;
  title: string;
  bannerImageUrl?: string | null;
  vacancies: number;
  cityId?: string | null;
  stipend?: number | null;
  durationMonths: number;
  applicationDeadline?: string | null;
  internshipType?: string;
  internshipDetail?: string | null;
  roleOverview?: string | null;
  keyResponsibilities?: string | null;
  eligibilityRequirements?: string | null;
  timelineWorkSchedule?: string | null;
  perksAndBenefits?: string | null;
  selectionProcess?: string | null;
  contactInformation?: string | null;
  screeningQuestions?: ScreeningQuestion[];
  eligibilityCheck?: EligibilityCheck | null;
  assessments?: AssessmentItem[];
  interviewRubric?: InterviewRubric | null;
  offerLetterTemplateUrl?: string | null;
  termsConditionUrl?: string | null;
  offerLetterReleaseMethod?: string | null;
  functionalGroupId?: string | null;
  preInternshipCommunication?: string | null;
  preReadCourses?: FileItem[];
  preReadArticles?: FileItem[];
  batches?: InternshipBatchProps[];
  totalWeeks?: number | null;
  weeklySchedule?: WeeklyScheduleEntry[];
  midTermFeedbackDate?: string | null;
  finalSubmissionDocuments?: string[];
  documentGuidelines?: string | null;
  presentationRubricUrl?: string | null;
  minPresentationScore?: number | null;
  presentationWeightage?: number | null;
  certificateTemplateUrl?: string | null;
}

export type UpdateInternshipDto = Omit<CreateInternshipDto, 'actorUserId' | 'tenantId'> & {
  actorUserId: string;
};
