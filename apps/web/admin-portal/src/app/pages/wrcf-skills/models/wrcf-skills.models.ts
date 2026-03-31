export interface SkillItem {
  id: string;
  name: string;
  capabilityInstanceId: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycleMonths: number;
  aiImpact: string;
}

export interface TaskItem {
  id: string;
  name: string;
  skillId: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration: number;
  requiredProficiencyLevel: string;
}

export interface ControlPointItem {
  id: string;
  name: string;
  taskId: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  kpiThreshold?: number;
  escalationRequired: boolean;
}

export type SkillsPanelEntity = 'Skill' | 'Task' | 'ControlPoint';

export interface SkillsPanelState {
  open: boolean;
  mode: 'create' | 'edit';
  entity: SkillsPanelEntity;
  data?: SkillItem | TaskItem | ControlPointItem;
}
