export interface SkillItem {
  id: string;
  name: string;
  ciId: string;
  description?: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycle: number;
  aiImpact: string;
}

export interface TaskItem {
  id: string;
  name: string;
  skillId: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration?: number;
  requiredProficiencyLevel?: number;
}

export interface ControlPointItem {
  id: string;
  name: string;
  taskId: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  kpiThreshold?: string;
  escalationRequired: string;
  evidenceType: string;
}

export type SkillsPanelEntity = 'Skill' | 'Task' | 'ControlPoint';

export interface SkillsPanelState {
  open: boolean;
  mode: 'create' | 'edit';
  entity: SkillsPanelEntity;
  data?: SkillItem | TaskItem | ControlPointItem;
}
