export interface ScreeningQuestion {
  question: string;
  expectedAnswer: string;
}

export interface EligibilityCheck {
  minClubPoints: number | null;
  minProjects: number | null;
  minInternships: number | null;
  minClubCertification: string | null;
}

export interface AssessmentItem {
  assessmentId: string;
  title: string;
  pdfUrl: string;
  minScore: number;
  weightage: number;
}

export interface InterviewRubricItem {
  assessmentId: string;
  title: string;
}

export interface InterviewRubric {
  items: InterviewRubricItem[];
  minScore: number;
  weightage: number;
}

export interface InternshipBatch {
  id: string;
  batchSize: number;
  coordinatorUserId: string | null;
}

export interface WeeklyScheduleEntry {
  functionalGroupId: string;
  capabilityInstanceId: string;
  coordinatorUserId: string;
  noOfWeeks: number;
  tasks: Array<{ title: string; evidence: string }>;
}

export interface FileItem {
  pdfUrl: string;
  name: string;
}

export interface InternshipListItem {
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
  applicantsCount?: number | null;
}

export interface InternshipDetail extends InternshipListItem {
  tenantId: string;
  cityId: string | null;
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
  batches: InternshipBatch[];
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

export interface InternshipFormValue {
  title: string;
  bannerImageUrl: string | null;
  vacancies: number;
  cityId: string | null;
  stipend: number | null;
  durationMonths: number;
  applicationDeadline: string | null;
  internshipType: string;
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
  batches: InternshipBatch[];
  totalWeeks: number | null;
  weeklySchedule: WeeklyScheduleEntry[];
  midTermFeedbackDate: string | null;
  finalSubmissionDocuments: string[];
  documentGuidelines: string | null;
  presentationRubricUrl: string | null;
  minPresentationScore: number | null;
  presentationWeightage: number | null;
  certificateTemplateUrl: string | null;
}

export interface City {
  id: string;
  name: string;
  state: string | null;
}

export interface IndustryRole {
  id: string;
  name: string;
}

export interface FunctionalGroup {
  id: string;
  name: string;
}

export interface UserContact {
  id: string;
  primaryEmail: string;
  displayName: string;
}

export interface MockAssessment {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string | null;
}

export type PageMode = 'list' | 'create' | 'edit';

export const INTERNSHIP_TYPE_OPTIONS = [
  { value: 'ONSITE', label: 'On-Site' },
  { value: 'REMOTE', label: 'Remote' },
] as const;

export const OFFER_RELEASE_METHOD_OPTIONS = [
  'On Uploading list of successful candidates',
  'Automated on selection',
  'Manual approval required',
] as const;

export const FINAL_DOCUMENT_OPTIONS = [
  'Report',
  'Presentation',
  'Portfolio',
  'Code Repository',
  'Research Paper',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  DRAFT:     'Draft',
  PUBLISHED: 'Published',
  ARCHIVED:  'Archived',
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-yellow-500/20 text-yellow-400',
  PUBLISHED: 'bg-green-500/20 text-green-400',
  ARCHIVED:  'bg-gray-500/20 text-gray-400',
};
