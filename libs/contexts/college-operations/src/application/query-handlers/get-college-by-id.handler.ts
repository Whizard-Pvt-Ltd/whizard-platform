import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export interface GetCollegeByIdQuery {
  collegeId: string;
}

export class GetCollegeByIdQueryHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(query: GetCollegeByIdQuery): Promise<CollegeDetailDto> {
    const college = await this.collegeRepo.findById(query.collegeId);
    if (!college) {
      throw Object.assign(new Error(`College ${query.collegeId} not found`), { name: 'DomainException' });
    }
    return toCollegeDetailDto(college, null);
  }
}
