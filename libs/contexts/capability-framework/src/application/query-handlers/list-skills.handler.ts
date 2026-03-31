import type { ISkillRepository } from '../../domain/repositories/skill.repository';
import type { SkillDto } from '../dto/skill.dto';

export class ListSkillsQueryHandler {
  constructor(private readonly repo: ISkillRepository) {}

  async execute(tenantId: string, capabilityInstanceId: string): Promise<SkillDto[]> {
    return this.repo.findAllDtos(tenantId, capabilityInstanceId);
  }
}
