import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { PublishCollegeCommand } from '../commands/publish-college.command.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export class PublishCollegeCommandHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(cmd: PublishCollegeCommand): Promise<CollegeDetailDto> {
    const college = await this.collegeRepo.findById(cmd.collegeId);
    if (!college) {
      throw Object.assign(new Error(`College ${cmd.collegeId} not found`), { name: 'DomainException' });
    }

    if (!college.canPublish()) {
      throw Object.assign(
        new Error('College cannot be published: mandatory fields are missing'),
        { name: 'DomainException' }
      );
    }

    college.publish();
    await this.collegeRepo.save(college);
    return toCollegeDetailDto(college, null);
  }
}
