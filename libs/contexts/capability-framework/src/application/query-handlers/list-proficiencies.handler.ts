import type { IProficiencyRepository } from '../../domain/repositories/proficiency.repository';
import type { ProficiencyDto } from '../dto/proficiency.dto';

export class ListProficienciesQueryHandler {
  constructor(private readonly proficiencyRepo: IProficiencyRepository) {}

  async execute(): Promise<ProficiencyDto[]> {
    const profs = await this.proficiencyRepo.findAll();
    return profs.map(p => ({
      id: p.id,
      level: p.level,
      label: p.label,
      description: p.description,
      weightage: p.weightage,
      isActive: p.isActive
    }));
  }
}
