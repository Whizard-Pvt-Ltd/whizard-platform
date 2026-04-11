import { getPrisma } from '@whizard/shared-infrastructure';
import type {
  ScreeningQuestion,
  EligibilityCheck,
  AssessmentItem,
  InterviewRubric,
  WeeklyScheduleEntry,
  FileItem,
  InternshipBatchProps,
} from '../../../domain/aggregates/internship.aggregate.js';
import type { IInternshipRepository, InternshipListFilter } from '../../../domain/repositories/internship.repository.js';
import { Internship } from '../../../domain/aggregates/internship.aggregate.js';
import { InternshipStatus } from '../../../domain/value-objects/internship-status.vo.js';
import { InternshipType } from '../../../domain/value-objects/internship-type.vo.js';

export class PrismaInternshipRepository implements IInternshipRepository {
  private get prisma() { return getPrisma(); }

  private resolveTenantId(numericId: string): bigint {
    return BigInt(numericId);
  }

  private async resolveUserId(idOrUuid: string): Promise<bigint> {
    if (/^\d+$/.test(idOrUuid)) return BigInt(idOrUuid);
    const user = await this.prisma.userAccount.findUnique({ where: { publicUuid: idOrUuid }, select: { id: true } });
    if (!user) throw new Error(`User not found: ${idOrUuid}`);
    return user.id;
  }

  private async resolveCityId(publicUuid: string): Promise<bigint | null> {
    const city = await this.prisma.city.findUnique({ where: { publicUuid }, select: { id: true } });
    return city?.id ?? null;
  }

  private async resolveFunctionalGroupId(publicUuid: string): Promise<bigint | null> {
    const fg = await this.prisma.functionalGroup.findUnique({ where: { publicUuid }, select: { id: true } });
    return fg?.id ?? null;
  }

  private async resolveMediaAssetId(key: string | null): Promise<bigint | null> {
    if (!key) return null;
    const asset = await this.prisma.mediaAsset.findFirst({ where: { key }, select: { id: true } });
    return asset?.id ?? null;
  }

  async findById(id: string): Promise<Internship | null> {
    const row = await this.prisma.internship.findUnique({
      where:   { publicUuid: id },
      include: { batches: true, city: { select: { publicUuid: true } }, functionalGroup: { select: { publicUuid: true } } },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(filter: InternshipListFilter): Promise<Internship[]> {
    const tenantId = this.resolveTenantId(filter.tenantId);
    // When a company is selected, scope by companyTenantId alone so results include
    // both company-owned internships (tenantId = company) and system-owned internships
    // assigned to that company (tenantId = system, companyTenantId = company).
    // When allTenants is set (SYSTEM admin viewing global scope), skip scope filter entirely.
    const scopeFilter = filter.allTenants
      ? {}
      : filter.companyTenantId
        ? { companyTenantId: BigInt(filter.companyTenantId) }
        : { tenantId };
    const rows = await this.prisma.internship.findMany({
      where: {
        ...scopeFilter,
        ...(filter.status && { status: filter.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }),
        ...(filter.search && { title: { contains: filter.search, mode: 'insensitive' as const } }),
      },
      include:  { batches: true, city: { select: { publicUuid: true } }, functionalGroup: { select: { publicUuid: true } } },
      orderBy:  { createdOn: 'desc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async findCityName(cityId: string): Promise<string | null> {
    const city = await this.prisma.city.findUnique({ where: { publicUuid: cityId }, select: { name: true } });
    return city?.name ?? null;
  }

  async save(internship: Internship): Promise<string> {
    const tenantId          = this.resolveTenantId(internship.tenantId);
    const createdBy         = await this.resolveUserId(internship.createdBy);
    const cityId            = internship.cityId ? await this.resolveCityId(internship.cityId) : null;
    const functionalGroupId = internship.functionalGroupId ? await this.resolveFunctionalGroupId(internship.functionalGroupId) : null;
    const [bannerImageAssetId, offerLetterAssetId, termsConditionAssetId, certificateAssetId] = await Promise.all([
      this.resolveMediaAssetId(internship.bannerImageUrl),
      this.resolveMediaAssetId(internship.offerLetterTemplateUrl),
      this.resolveMediaAssetId(internship.termsConditionUrl),
      this.resolveMediaAssetId(internship.certificateTemplateUrl),
    ]);
    const data = {
      tenantId,
      companyTenantId:            internship.companyTenantId ? BigInt(internship.companyTenantId) : null,
      title:                      internship.title,
      bannerImageUrl:             internship.bannerImageUrl,
      bannerImageAssetId,
      vacancies:                  internship.vacancies,
      cityId,
      stipend:                    internship.stipend,
      durationMonths:             internship.durationMonths,
      applicationDeadline:        internship.applicationDeadline,
      internshipType:             internship.internshipType as 'ONSITE' | 'REMOTE',
      status:                     internship.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      internshipDetail:           internship.internshipDetail,
      roleOverview:               internship.roleOverview,
      keyResponsibilities:        internship.keyResponsibilities,
      eligibilityRequirements:    internship.eligibilityRequirements,
      timelineWorkSchedule:       internship.timelineWorkSchedule,
      perksAndBenefits:           internship.perksAndBenefits,
      selectionProcess:           internship.selectionProcess,
      contactInformation:         internship.contactInformation,
      screeningQuestions:         internship.screeningQuestions as unknown as object,
      eligibilityCheck:           internship.eligibilityCheck as unknown as object ?? undefined,
      assessments:                internship.assessments as unknown as object,
      interviewRubric:            internship.interviewRubric as unknown as object ?? undefined,
      offerLetterTemplateUrl:     internship.offerLetterTemplateUrl,
      offerLetterAssetId,
      termsConditionUrl:          internship.termsConditionUrl,
      termsConditionAssetId,
      offerLetterReleaseMethod:   internship.offerLetterReleaseMethod,
      functionalGroupId,
      preInternshipCommunication: internship.preInternshipCommunication,
      preReadCourses:             internship.preReadCourses as unknown as object,
      preReadArticles:            internship.preReadArticles as unknown as object,
      totalWeeks:                 internship.totalWeeks,
      weeklySchedule:             internship.weeklySchedule as unknown as object,
      midTermFeedbackDate:        internship.midTermFeedbackDate,
      finalSubmissionDocuments:   internship.finalSubmissionDocuments as unknown as object,
      documentGuidelines:         internship.documentGuidelines,
      presentationRubricUrl:      internship.presentationRubricUrl,
      minPresentationScore:       internship.minPresentationScore,
      presentationWeightage:      internship.presentationWeightage,
      certificateTemplateUrl:     internship.certificateTemplateUrl,
      certificateAssetId,
      createdBy,
    };

    const record = await this.prisma.$transaction(async (tx) => {
      const upserted = await tx.internship.upsert({
        where:  { publicUuid: internship.id },
        update: data,
        create: { ...data, publicUuid: internship.id },
        select: { id: true, publicUuid: true },
      });

      // Sync batches
      await tx.internshipBatch.deleteMany({ where: { internshipId: upserted.id } });
      if (internship.batches.length > 0) {
        const batchData = await Promise.all(internship.batches.map(async b => ({
          internshipId:      upserted.id,
          batchSize:         b.batchSize,
          coordinatorUserId: b.coordinatorUserId ? await this.resolveUserId(b.coordinatorUserId) : null,
        })));
        await tx.internshipBatch.createMany({ data: batchData });
      }

      return upserted;
    });

    return record.publicUuid;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.internship.delete({ where: { publicUuid: id } });
  }

  private toDomain(row: {
    id: bigint;
    publicUuid: string;
    tenantId: bigint;
    companyTenantId: bigint | null;
    title: string;
    bannerImageUrl: string | null;
    vacancies: number;
    cityId: bigint | null;
    stipend: unknown;
    durationMonths: number;
    applicationDeadline: Date | null;
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
    screeningQuestions: unknown;
    eligibilityCheck: unknown;
    assessments: unknown;
    interviewRubric: unknown;
    offerLetterTemplateUrl: string | null;
    termsConditionUrl: string | null;
    offerLetterReleaseMethod: string | null;
    functionalGroupId: bigint | null;
    preInternshipCommunication: string | null;
    preReadCourses: unknown;
    preReadArticles: unknown;
    totalWeeks: number | null;
    weeklySchedule: unknown;
    midTermFeedbackDate: Date | null;
    finalSubmissionDocuments: unknown;
    documentGuidelines: string | null;
    presentationRubricUrl: string | null;
    minPresentationScore: unknown;
    presentationWeightage: unknown;
    certificateTemplateUrl: string | null;
    createdBy: bigint;
    createdOn: Date;
    updatedOn: Date;
    batches?: Array<{ publicUuid: string; batchSize: number; coordinatorUserId: bigint | null; createdOn: Date }>;
    city?: { publicUuid: string } | null;
    functionalGroup?: { publicUuid: string } | null;
  }): Internship {
    return Internship.reconstitute({
      id:                          row.publicUuid,
      tenantId:                    row.tenantId.toString(),
      companyTenantId:             row.companyTenantId?.toString() ?? null,
      title:                       row.title,
      bannerImageUrl:              row.bannerImageUrl,
      vacancies:                   row.vacancies,
      cityId:                      row.city?.publicUuid ?? null,
      stipend:                     row.stipend != null ? Number(row.stipend) : null,
      durationMonths:              row.durationMonths,
      applicationDeadline:         row.applicationDeadline,
      internshipType:              row.internshipType as InternshipType,
      status:                      row.status as InternshipStatus,
      internshipDetail:            row.internshipDetail,
      roleOverview:                row.roleOverview,
      keyResponsibilities:         row.keyResponsibilities,
      eligibilityRequirements:     row.eligibilityRequirements,
      timelineWorkSchedule:        row.timelineWorkSchedule,
      perksAndBenefits:            row.perksAndBenefits,
      selectionProcess:            row.selectionProcess,
      contactInformation:          row.contactInformation,
      screeningQuestions:          (row.screeningQuestions as ScreeningQuestion[]) ?? [],
      eligibilityCheck:            (row.eligibilityCheck as EligibilityCheck | null) ?? null,
      assessments:                 (row.assessments as AssessmentItem[]) ?? [],
      interviewRubric:             (row.interviewRubric as InterviewRubric | null) ?? null,
      offerLetterTemplateUrl:      row.offerLetterTemplateUrl,
      termsConditionUrl:           row.termsConditionUrl,
      offerLetterReleaseMethod:    row.offerLetterReleaseMethod,
      functionalGroupId:           row.functionalGroup?.publicUuid ?? null,
      preInternshipCommunication:  row.preInternshipCommunication,
      preReadCourses:              (row.preReadCourses as FileItem[]) ?? [],
      preReadArticles:             (row.preReadArticles as FileItem[]) ?? [],
      batches:                     (row.batches ?? []).map(b => ({
        id:                b.publicUuid,
        batchSize:         b.batchSize,
        coordinatorUserId: b.coordinatorUserId?.toString() ?? null,
      }) as InternshipBatchProps),
      totalWeeks:                  row.totalWeeks,
      weeklySchedule:              (row.weeklySchedule as WeeklyScheduleEntry[]) ?? [],
      midTermFeedbackDate:         row.midTermFeedbackDate,
      finalSubmissionDocuments:    (row.finalSubmissionDocuments as string[]) ?? [],
      documentGuidelines:          row.documentGuidelines,
      presentationRubricUrl:       row.presentationRubricUrl,
      minPresentationScore:        row.minPresentationScore != null ? Number(row.minPresentationScore) : null,
      presentationWeightage:       row.presentationWeightage != null ? Number(row.presentationWeightage) : null,
      certificateTemplateUrl:      row.certificateTemplateUrl,
      createdBy:                   row.createdBy.toString(),
      createdOn:                   row.createdOn,
      updatedOn:                   row.updatedOn,
    });
  }
}
