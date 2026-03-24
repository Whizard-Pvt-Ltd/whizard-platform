export interface SkillDto {
  id: string;
  ciId: string;
  name: string;
  description?: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycle: number;
  aiImpact: string;
}
