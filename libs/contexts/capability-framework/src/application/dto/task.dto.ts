export interface TaskDto {
  id: string;
  skillId: string;
  name: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration?: number;
  requiredProficiencyLevel?: number;
}
