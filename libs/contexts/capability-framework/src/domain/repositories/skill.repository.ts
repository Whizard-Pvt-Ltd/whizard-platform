import type { Skill } from '../aggregates/skill.aggregate';

export interface SkillDto {
  id: string;
  capabilityInstanceId: string;
  name: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycleMonths: number;
  aiImpact: string;
  canEdit: boolean;
}

export interface ISkillRepository {
  findByCapabilityInstanceId(tenantId: string, capabilityInstanceId: string): Promise<Skill[]>;
  findAllDtos(capabilityInstanceId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<SkillDto[]>;
  findById(id: string): Promise<Skill | null>;
  save(skill: Skill): Promise<void>;
  update(skill: Skill): Promise<void>;
  delete(id: string): Promise<void>;
}
