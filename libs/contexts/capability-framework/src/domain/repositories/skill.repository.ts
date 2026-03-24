import type { Skill } from '../aggregates/skill.aggregate';

export interface ISkillRepository {
  findByCiId(tenantId: string, ciId: string): Promise<Skill[]>;
  findAllDtos(tenantId: string, ciId: string): Promise<{
    id: string;
    ciId: string;
    name: string;
    description?: string;
    cognitiveType: string;
    skillCriticality: string;
    recertificationCycle: number;
    aiImpact: string;
  }[]>;
  findById(id: string): Promise<Skill | null>;
  save(skill: Skill): Promise<void>;
  update(skill: Skill): Promise<void>;
  delete(id: string): Promise<void>;
}
