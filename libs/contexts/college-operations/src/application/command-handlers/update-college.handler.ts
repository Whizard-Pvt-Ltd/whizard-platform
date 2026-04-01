import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { UpdateCollegeCommand } from '../commands/update-college.command.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export class UpdateCollegeCommandHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(cmd: UpdateCollegeCommand): Promise<CollegeDetailDto> {
    const college = await this.collegeRepo.findById(cmd.collegeId);
    if (!college) {
      throw Object.assign(new Error(`College ${cmd.collegeId} not found`), { name: 'DomainException' });
    }

    if (cmd.name && cmd.name !== college.name) {
      const nameExists = await this.collegeRepo.existsByName(cmd.tenantId, cmd.name, cmd.collegeId);
      if (nameExists) {
        throw Object.assign(new Error(`College with name "${cmd.name}" already exists`), { name: 'DomainException' });
      }
    }

    college.update({
      name: cmd.name,
      affiliatedUniversity: cmd.affiliatedUniversity,
      cityId: cmd.cityId,
      collegeType: cmd.collegeType,
      establishedYear: cmd.establishedYear,
      description: cmd.description,
      degreesOffered: cmd.degreesOffered,
      placementHighlights: cmd.placementHighlights,
      inquiryEmail: cmd.inquiryEmail,
      clubIds: cmd.clubIds,
      programIds: cmd.programIds,
      mediaItems: cmd.mediaItems,
      contacts: cmd.contacts,
    });

    await this.collegeRepo.save(college);
    return toCollegeDetailDto(college, null);
  }
}
