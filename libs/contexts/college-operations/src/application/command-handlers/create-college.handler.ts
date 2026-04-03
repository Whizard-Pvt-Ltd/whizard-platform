import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { CreateCollegeCommand } from '../commands/create-college.command.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { College } from '../../domain/aggregates/college.aggregate.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export class CreateCollegeCommandHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(cmd: CreateCollegeCommand): Promise<CollegeDetailDto> {
    const nameExists = await this.collegeRepo.existsByName(cmd.tenantId, cmd.name);
    if (nameExists) {
      throw Object.assign(new Error(`College with name "${cmd.name}" already exists`), { name: 'DomainException' });
    }

    let cityCode = cmd.cityCode ?? null;
    if (!cityCode && cmd.cityId) {
      const cityRow = await getPrisma().city.findUnique({
        where: { id: BigInt(cmd.cityId) },
        select: { cityCode: true },
      });
      cityCode = cityRow?.cityCode ?? null;
    }

    const college = College.create({
      tenantId: cmd.tenantId,
      name: cmd.name,
      affiliatedUniversity: cmd.affiliatedUniversity,
      cityId: cmd.cityId,
      cityCode,
      collegeType: cmd.collegeType,
      establishedYear: cmd.establishedYear,
      description: cmd.description,
      degreesOffered: cmd.degreesOffered,
      placementHighlights: cmd.placementHighlights,
      inquiryEmail: cmd.inquiryEmail,
      createdBy: cmd.actorUserId,
    });

    college.update({ clubIds: cmd.clubIds, programIds: cmd.programIds });
    const savedId = await this.collegeRepo.save(college);
    const saved = await this.collegeRepo.findById(savedId);

    const cityRow = cityCode && cmd.cityId
      ? await getPrisma().city.findUnique({ where: { id: BigInt(cmd.cityId) }, select: { name: true } })
      : null;

    return toCollegeDetailDto(saved!, cityRow?.name ?? null);
  }
}
