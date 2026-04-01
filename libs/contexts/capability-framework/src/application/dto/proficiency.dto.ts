export interface ProficiencyDto {
  id: string;
  level: string;
  label: string;
  description?: string;
  weightage?: number;
  isActive: boolean;
}
