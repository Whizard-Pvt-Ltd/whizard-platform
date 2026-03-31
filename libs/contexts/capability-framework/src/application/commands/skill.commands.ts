export interface CreateSkillCommand {
  tenantId: string;
  capabilityInstanceId: string;
  name: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycleMonths: number;
  aiImpact: string;
}

export interface UpdateSkillCommand {
  id: string;
  tenantId: string;
  name?: string;
  cognitiveType?: string;
  skillCriticality?: string;
  recertificationCycleMonths?: number;
  aiImpact?: string;
}

export interface DeleteSkillCommand {
  id: string;
  tenantId: string;
}
