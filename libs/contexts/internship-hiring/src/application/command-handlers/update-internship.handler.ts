import type { IInternshipRepository } from '../../domain/repositories/internship.repository.js';
import type { UpdateInternshipCommand } from '../commands/update-internship.command.js';
import type { InternshipDetailDto } from '../dto/internship.dto.js';
import { InternshipNotFoundException } from '../../domain/exceptions/internship-not-found.exception.js';
import { InternshipType } from '../../domain/value-objects/internship-type.vo.js';
import { toInternshipDetailDto } from '../mappers/internship.mapper.js';

export class UpdateInternshipCommandHandler {
  constructor(private readonly repo: IInternshipRepository) {}

  async execute(cmd: UpdateInternshipCommand): Promise<InternshipDetailDto> {
    const internship = await this.repo.findById(cmd.id);
    if (!internship) throw new InternshipNotFoundException(cmd.id);

    internship.update({
      title:                       cmd.title,
      bannerImageUrl:              cmd.bannerImageUrl ?? undefined,
      vacancies:                   cmd.vacancies,
      cityId:                      cmd.cityId ?? undefined,
      stipend:                     cmd.stipend ?? undefined,
      durationMonths:              cmd.durationMonths,
      applicationDeadline:         cmd.applicationDeadline ? new Date(cmd.applicationDeadline) : null,
      internshipType:              cmd.internshipType ? (cmd.internshipType as InternshipType) : undefined,
      internshipDetail:            cmd.internshipDetail ?? undefined,
      roleOverview:                cmd.roleOverview ?? undefined,
      keyResponsibilities:         cmd.keyResponsibilities ?? undefined,
      eligibilityRequirements:     cmd.eligibilityRequirements ?? undefined,
      timelineWorkSchedule:        cmd.timelineWorkSchedule ?? undefined,
      perksAndBenefits:            cmd.perksAndBenefits ?? undefined,
      selectionProcess:            cmd.selectionProcess ?? undefined,
      contactInformation:          cmd.contactInformation ?? undefined,
      screeningQuestions:          cmd.screeningQuestions,
      eligibilityCheck:            cmd.eligibilityCheck ?? undefined,
      assessments:                 cmd.assessments,
      interviewRubric:             cmd.interviewRubric ?? undefined,
      offerLetterTemplateUrl:      cmd.offerLetterTemplateUrl ?? undefined,
      termsConditionUrl:           cmd.termsConditionUrl ?? undefined,
      offerLetterReleaseMethod:    cmd.offerLetterReleaseMethod ?? undefined,
      functionalGroupId:           cmd.functionalGroupId ?? undefined,
      preInternshipCommunication:  cmd.preInternshipCommunication ?? undefined,
      preReadCourses:              cmd.preReadCourses,
      preReadArticles:             cmd.preReadArticles,
      batches:                     cmd.batches,
      totalWeeks:                  cmd.totalWeeks ?? undefined,
      weeklySchedule:              cmd.weeklySchedule,
      midTermFeedbackDate:         cmd.midTermFeedbackDate ? new Date(cmd.midTermFeedbackDate) : null,
      finalSubmissionDocuments:    cmd.finalSubmissionDocuments,
      documentGuidelines:          cmd.documentGuidelines ?? undefined,
      presentationRubricUrl:       cmd.presentationRubricUrl ?? undefined,
      minPresentationScore:        cmd.minPresentationScore ?? undefined,
      presentationWeightage:       cmd.presentationWeightage ?? undefined,
      certificateTemplateUrl:      cmd.certificateTemplateUrl ?? undefined,
    });

    await this.repo.save(internship);
    const saved = await this.repo.findById(cmd.id);
    return toInternshipDetailDto(saved!, null);
  }
}
