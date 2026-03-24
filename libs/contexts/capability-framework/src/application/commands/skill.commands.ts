export interface CreateSkillCommand {
  tenantId: string;
  ciId: string;
  name: string;
  description?: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycle: number;
  aiImpact: string;
}

export interface UpdateSkillCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  cognitiveType?: string;
  skillCriticality?: string;
  recertificationCycle?: number;
  aiImpact?: string;
}

export interface DeleteSkillCommand {
  id: string;
  tenantId: string;
}
