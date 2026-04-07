import { InternshipStatus } from '../value-objects/internship-status.vo.js';
import { InternshipType } from '../value-objects/internship-type.vo.js';

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
  pdfUrl: string;
  minScore: number;
  weightage: number;
}

export interface InterviewRubric {
  pdfUrl: string;
  minScore: number;
  weightage: number;
}

export interface InternshipBatchProps {
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

export interface InternshipProps {
  id: string;
  tenantId: string;
  companyTenantId: string | null;
  title: string;
  bannerImageUrl: string | null;
  vacancies: number;
  cityId: string | null;
  stipend: number | null;
  durationMonths: number;
  applicationDeadline: Date | null;
  internshipType: InternshipType;
  status: InternshipStatus;
  // About
  internshipDetail: string | null;
  roleOverview: string | null;
  keyResponsibilities: string | null;
  eligibilityRequirements: string | null;
  timelineWorkSchedule: string | null;
  perksAndBenefits: string | null;
  selectionProcess: string | null;
  contactInformation: string | null;
  // Screening
  screeningQuestions: ScreeningQuestion[];
  eligibilityCheck: EligibilityCheck | null;
  assessments: AssessmentItem[];
  interviewRubric: InterviewRubric | null;
  // Selection
  offerLetterTemplateUrl: string | null;
  termsConditionUrl: string | null;
  offerLetterReleaseMethod: string | null;
  functionalGroupId: string | null;
  preInternshipCommunication: string | null;
  preReadCourses: FileItem[];
  preReadArticles: FileItem[];
  batches: InternshipBatchProps[];
  // During
  totalWeeks: number | null;
  weeklySchedule: WeeklyScheduleEntry[];
  midTermFeedbackDate: Date | null;
  // Final submission
  finalSubmissionDocuments: string[];
  documentGuidelines: string | null;
  presentationRubricUrl: string | null;
  minPresentationScore: number | null;
  presentationWeightage: number | null;
  certificateTemplateUrl: string | null;
  // Audit
  createdBy: string;
  createdOn: Date;
  updatedOn: Date;
}

export class Internship {
  readonly id: string;
  readonly tenantId: string;
  readonly createdBy: string;
  readonly createdOn: Date;

  private _companyTenantId: string | null;
  private _title: string;
  private _bannerImageUrl: string | null;
  private _vacancies: number;
  private _cityId: string | null;
  private _stipend: number | null;
  private _durationMonths: number;
  private _applicationDeadline: Date | null;
  private _internshipType: InternshipType;
  private _status: InternshipStatus;
  private _internshipDetail: string | null;
  private _roleOverview: string | null;
  private _keyResponsibilities: string | null;
  private _eligibilityRequirements: string | null;
  private _timelineWorkSchedule: string | null;
  private _perksAndBenefits: string | null;
  private _selectionProcess: string | null;
  private _contactInformation: string | null;
  private _screeningQuestions: ScreeningQuestion[];
  private _eligibilityCheck: EligibilityCheck | null;
  private _assessments: AssessmentItem[];
  private _interviewRubric: InterviewRubric | null;
  private _offerLetterTemplateUrl: string | null;
  private _termsConditionUrl: string | null;
  private _offerLetterReleaseMethod: string | null;
  private _functionalGroupId: string | null;
  private _preInternshipCommunication: string | null;
  private _preReadCourses: FileItem[];
  private _preReadArticles: FileItem[];
  private _batches: InternshipBatchProps[];
  private _totalWeeks: number | null;
  private _weeklySchedule: WeeklyScheduleEntry[];
  private _midTermFeedbackDate: Date | null;
  private _finalSubmissionDocuments: string[];
  private _documentGuidelines: string | null;
  private _presentationRubricUrl: string | null;
  private _minPresentationScore: number | null;
  private _presentationWeightage: number | null;
  private _certificateTemplateUrl: string | null;
  private _updatedOn: Date;

  private constructor(props: InternshipProps) {
    this.id                          = props.id;
    this.tenantId                    = props.tenantId;
    this._companyTenantId            = props.companyTenantId;
    this.createdBy                   = props.createdBy;
    this.createdOn                   = props.createdOn;
    this._title                      = props.title;
    this._bannerImageUrl             = props.bannerImageUrl;
    this._vacancies                  = props.vacancies;
    this._cityId                     = props.cityId;
    this._stipend                    = props.stipend;
    this._durationMonths             = props.durationMonths;
    this._applicationDeadline        = props.applicationDeadline;
    this._internshipType             = props.internshipType;
    this._status                     = props.status;
    this._internshipDetail           = props.internshipDetail;
    this._roleOverview               = props.roleOverview;
    this._keyResponsibilities        = props.keyResponsibilities;
    this._eligibilityRequirements    = props.eligibilityRequirements;
    this._timelineWorkSchedule       = props.timelineWorkSchedule;
    this._perksAndBenefits           = props.perksAndBenefits;
    this._selectionProcess           = props.selectionProcess;
    this._contactInformation         = props.contactInformation;
    this._screeningQuestions         = props.screeningQuestions;
    this._eligibilityCheck           = props.eligibilityCheck;
    this._assessments                = props.assessments;
    this._interviewRubric            = props.interviewRubric;
    this._offerLetterTemplateUrl     = props.offerLetterTemplateUrl;
    this._termsConditionUrl          = props.termsConditionUrl;
    this._offerLetterReleaseMethod   = props.offerLetterReleaseMethod;
    this._functionalGroupId          = props.functionalGroupId;
    this._preInternshipCommunication = props.preInternshipCommunication;
    this._preReadCourses             = props.preReadCourses;
    this._preReadArticles            = props.preReadArticles;
    this._batches                    = props.batches;
    this._totalWeeks                 = props.totalWeeks;
    this._weeklySchedule             = props.weeklySchedule;
    this._midTermFeedbackDate        = props.midTermFeedbackDate;
    this._finalSubmissionDocuments   = props.finalSubmissionDocuments;
    this._documentGuidelines         = props.documentGuidelines;
    this._presentationRubricUrl      = props.presentationRubricUrl;
    this._minPresentationScore       = props.minPresentationScore;
    this._presentationWeightage      = props.presentationWeightage;
    this._certificateTemplateUrl     = props.certificateTemplateUrl;
    this._updatedOn                  = props.updatedOn;
  }

  static create(props: Omit<InternshipProps, 'status' | 'createdOn' | 'updatedOn'>): Internship {
    const now = new Date();
    return new Internship({
      ...props,
      companyTenantId: props.companyTenantId ?? null,
      status:    InternshipStatus.Draft,
      createdOn: now,
      updatedOn: now,
    });
  }

  static reconstitute(props: InternshipProps): Internship {
    return new Internship(props);
  }

  get companyTenantId()            { return this._companyTenantId; }
  get title()                      { return this._title; }
  get bannerImageUrl()             { return this._bannerImageUrl; }
  get vacancies()                  { return this._vacancies; }
  get cityId()                     { return this._cityId; }
  get stipend()                    { return this._stipend; }
  get durationMonths()             { return this._durationMonths; }
  get applicationDeadline()        { return this._applicationDeadline; }
  get internshipType()             { return this._internshipType; }
  get status()                     { return this._status; }
  get internshipDetail()           { return this._internshipDetail; }
  get roleOverview()               { return this._roleOverview; }
  get keyResponsibilities()        { return this._keyResponsibilities; }
  get eligibilityRequirements()    { return this._eligibilityRequirements; }
  get timelineWorkSchedule()       { return this._timelineWorkSchedule; }
  get perksAndBenefits()           { return this._perksAndBenefits; }
  get selectionProcess()           { return this._selectionProcess; }
  get contactInformation()         { return this._contactInformation; }
  get screeningQuestions()         { return [...this._screeningQuestions]; }
  get eligibilityCheck()           { return this._eligibilityCheck; }
  get assessments()                { return [...this._assessments]; }
  get interviewRubric()            { return this._interviewRubric; }
  get offerLetterTemplateUrl()     { return this._offerLetterTemplateUrl; }
  get termsConditionUrl()          { return this._termsConditionUrl; }
  get offerLetterReleaseMethod()   { return this._offerLetterReleaseMethod; }
  get functionalGroupId()          { return this._functionalGroupId; }
  get preInternshipCommunication() { return this._preInternshipCommunication; }
  get preReadCourses()             { return [...this._preReadCourses]; }
  get preReadArticles()            { return [...this._preReadArticles]; }
  get batches()                    { return [...this._batches]; }
  get totalWeeks()                 { return this._totalWeeks; }
  get weeklySchedule()             { return [...this._weeklySchedule]; }
  get midTermFeedbackDate()        { return this._midTermFeedbackDate; }
  get finalSubmissionDocuments()   { return [...this._finalSubmissionDocuments]; }
  get documentGuidelines()         { return this._documentGuidelines; }
  get presentationRubricUrl()      { return this._presentationRubricUrl; }
  get minPresentationScore()       { return this._minPresentationScore; }
  get presentationWeightage()      { return this._presentationWeightage; }
  get certificateTemplateUrl()     { return this._certificateTemplateUrl; }
  get updatedOn()                  { return this._updatedOn; }

  update(fields: Partial<Omit<InternshipProps, 'id' | 'tenantId' | 'status' | 'createdBy' | 'createdOn' | 'updatedOn'>>): void {
    if (fields.companyTenantId            !== undefined) this._companyTenantId            = fields.companyTenantId;
    if (fields.title                      !== undefined) this._title                      = fields.title;
    if (fields.bannerImageUrl             !== undefined) this._bannerImageUrl             = fields.bannerImageUrl;
    if (fields.vacancies                  !== undefined) this._vacancies                  = fields.vacancies;
    if (fields.cityId                     !== undefined) this._cityId                     = fields.cityId;
    if (fields.stipend                    !== undefined) this._stipend                    = fields.stipend;
    if (fields.durationMonths             !== undefined) this._durationMonths             = fields.durationMonths;
    if (fields.applicationDeadline        !== undefined) this._applicationDeadline        = fields.applicationDeadline;
    if (fields.internshipType             !== undefined) this._internshipType             = fields.internshipType;
    if (fields.internshipDetail           !== undefined) this._internshipDetail           = fields.internshipDetail;
    if (fields.roleOverview               !== undefined) this._roleOverview               = fields.roleOverview;
    if (fields.keyResponsibilities        !== undefined) this._keyResponsibilities        = fields.keyResponsibilities;
    if (fields.eligibilityRequirements    !== undefined) this._eligibilityRequirements    = fields.eligibilityRequirements;
    if (fields.timelineWorkSchedule       !== undefined) this._timelineWorkSchedule       = fields.timelineWorkSchedule;
    if (fields.perksAndBenefits           !== undefined) this._perksAndBenefits           = fields.perksAndBenefits;
    if (fields.selectionProcess           !== undefined) this._selectionProcess           = fields.selectionProcess;
    if (fields.contactInformation         !== undefined) this._contactInformation         = fields.contactInformation;
    if (fields.screeningQuestions         !== undefined) this._screeningQuestions         = fields.screeningQuestions;
    if (fields.eligibilityCheck           !== undefined) this._eligibilityCheck           = fields.eligibilityCheck;
    if (fields.assessments                !== undefined) this._assessments                = fields.assessments;
    if (fields.interviewRubric            !== undefined) this._interviewRubric            = fields.interviewRubric;
    if (fields.offerLetterTemplateUrl     !== undefined) this._offerLetterTemplateUrl     = fields.offerLetterTemplateUrl;
    if (fields.termsConditionUrl          !== undefined) this._termsConditionUrl          = fields.termsConditionUrl;
    if (fields.offerLetterReleaseMethod   !== undefined) this._offerLetterReleaseMethod   = fields.offerLetterReleaseMethod;
    if (fields.functionalGroupId          !== undefined) this._functionalGroupId          = fields.functionalGroupId;
    if (fields.preInternshipCommunication !== undefined) this._preInternshipCommunication = fields.preInternshipCommunication;
    if (fields.preReadCourses             !== undefined) this._preReadCourses             = fields.preReadCourses;
    if (fields.preReadArticles            !== undefined) this._preReadArticles            = fields.preReadArticles;
    if (fields.batches                    !== undefined) this._batches                    = fields.batches;
    if (fields.totalWeeks                 !== undefined) this._totalWeeks                 = fields.totalWeeks;
    if (fields.weeklySchedule             !== undefined) this._weeklySchedule             = fields.weeklySchedule;
    if (fields.midTermFeedbackDate        !== undefined) this._midTermFeedbackDate        = fields.midTermFeedbackDate;
    if (fields.finalSubmissionDocuments   !== undefined) this._finalSubmissionDocuments   = fields.finalSubmissionDocuments;
    if (fields.documentGuidelines         !== undefined) this._documentGuidelines         = fields.documentGuidelines;
    if (fields.presentationRubricUrl      !== undefined) this._presentationRubricUrl      = fields.presentationRubricUrl;
    if (fields.minPresentationScore       !== undefined) this._minPresentationScore       = fields.minPresentationScore;
    if (fields.presentationWeightage      !== undefined) this._presentationWeightage      = fields.presentationWeightage;
    if (fields.certificateTemplateUrl     !== undefined) this._certificateTemplateUrl     = fields.certificateTemplateUrl;
    this._updatedOn = new Date();
  }

  publish(): void {
    this._status    = InternshipStatus.Published;
    this._updatedOn = new Date();
  }

  archive(): void {
    this._status    = InternshipStatus.Archived;
    this._updatedOn = new Date();
  }
}
