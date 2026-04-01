import type { IDegreeProgramRepository } from '../../domain/repositories/degree-program.repository.js';
import type { DegreeProgramDto } from '../dto/college.dto.js';

export class ListDegreeProgramsQueryHandler {
  constructor(private readonly programRepo: IDegreeProgramRepository) {}

  async execute(): Promise<DegreeProgramDto[]> {
    const programs = await this.programRepo.findAll();
    return programs.map(p => ({
      id: p.id,
      name: p.name,
      level: p.level,
      durationYears: p.durationYears,
      specializations: p.specializations.map(s => ({ id: s.id, name: s.name })),
    }));
  }
}
