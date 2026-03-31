import { randomUUID } from 'crypto';
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

    const college = College.create({
      id: randomUUID(),
      tenantId: cmd.tenantId,
      name: cmd.name,
      affiliatedUniversity: cmd.affiliatedUniversity,
      cityId: cmd.cityId,
      cityName: cmd.cityName,
      collegeType: cmd.collegeType,
      establishedYear: cmd.establishedYear,
      description: cmd.description,
      degreesOffered: cmd.degreesOffered,
      placementHighlights: cmd.placementHighlights,
      inquiryEmail: cmd.inquiryEmail,
      createdBy: cmd.actorUserId,
    });

    college.update({ clubIds: cmd.clubIds, programIds: cmd.programIds });
    await this.collegeRepo.save(college);
    return toCollegeDetailDto(college, null);
  }
}
