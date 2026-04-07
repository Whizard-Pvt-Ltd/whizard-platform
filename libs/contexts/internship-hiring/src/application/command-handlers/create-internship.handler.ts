import { randomUUID } from 'crypto';
import type { IInternshipRepository } from '../../domain/repositories/internship.repository.js';
import type { CreateInternshipCommand } from '../commands/create-internship.command.js';
import type { InternshipDetailDto } from '../dto/internship.dto.js';
import { Internship } from '../../domain/aggregates/internship.aggregate.js';
import { InternshipType } from '../../domain/value-objects/internship-type.vo.js';
import { toInternshipDetailDto } from '../mappers/internship.mapper.js';

export class CreateInternshipCommandHandler {
  constructor(private readonly repo: IInternshipRepository) {}

  async execute(cmd: CreateInternshipCommand): Promise<InternshipDetailDto> {
    const internship = Internship.create({
      id:                          randomUUID(),
      tenantId:                    cmd.tenantId,
      companyTenantId:             cmd.companyTenantId ?? null,
      title:                       cmd.title,
      bannerImageUrl:              cmd.bannerImageUrl ?? null,
      vacancies:                   cmd.vacancies,
      cityId:                      cmd.cityId ?? null,
      stipend:                     cmd.stipend ?? null,
      durationMonths:              cmd.durationMonths,
      applicationDeadline:         cmd.applicationDeadline ? new Date(cmd.applicationDeadline) : null,
      internshipType:              (cmd.internshipType as InternshipType) ?? InternshipType.OnSite,
      internshipDetail:            cmd.internshipDetail ?? null,
      roleOverview:                cmd.roleOverview ?? null,
      keyResponsibilities:         cmd.keyResponsibilities ?? null,
      eligibilityRequirements:     cmd.eligibilityRequirements ?? null,
      timelineWorkSchedule:        cmd.timelineWorkSchedule ?? null,
      perksAndBenefits:            cmd.perksAndBenefits ?? null,
      selectionProcess:            cmd.selectionProcess ?? null,
      contactInformation:          cmd.contactInformation ?? null,
      screeningQuestions:          cmd.screeningQuestions ?? [],
      eligibilityCheck:            cmd.eligibilityCheck ?? null,
      assessments:                 cmd.assessments ?? [],
      interviewRubric:             cmd.interviewRubric ?? null,
      offerLetterTemplateUrl:      cmd.offerLetterTemplateUrl ?? null,
      termsConditionUrl:           cmd.termsConditionUrl ?? null,
      offerLetterReleaseMethod:    cmd.offerLetterReleaseMethod ?? null,
      functionalGroupId:           cmd.functionalGroupId ?? null,
      preInternshipCommunication:  cmd.preInternshipCommunication ?? null,
      preReadCourses:              cmd.preReadCourses ?? [],
      preReadArticles:             cmd.preReadArticles ?? [],
      batches:                     cmd.batches ?? [],
      totalWeeks:                  cmd.totalWeeks ?? null,
      weeklySchedule:              cmd.weeklySchedule ?? [],
      midTermFeedbackDate:         cmd.midTermFeedbackDate ? new Date(cmd.midTermFeedbackDate) : null,
      finalSubmissionDocuments:    cmd.finalSubmissionDocuments ?? [],
      documentGuidelines:          cmd.documentGuidelines ?? null,
      presentationRubricUrl:       cmd.presentationRubricUrl ?? null,
      minPresentationScore:        cmd.minPresentationScore ?? null,
      presentationWeightage:       cmd.presentationWeightage ?? null,
      certificateTemplateUrl:      cmd.certificateTemplateUrl ?? null,
      createdBy:                   cmd.actorUserId,
    });

    await this.repo.save(internship);
    const saved = await this.repo.findById(internship.id);
    return toInternshipDetailDto(saved!, null);
  }
}
