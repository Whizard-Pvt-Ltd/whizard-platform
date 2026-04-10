export interface Department {
  id: string;
  name: string;
  industryId?: string;
  functionalGroupIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
  canEdit?: boolean;
}

export interface IndustryRole {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
  seniorityLevel: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
  canEdit?: boolean;
}

export interface PendingCIMapping {
  capabilityInstanceId: string;
  fgName: string;
  pwoName: string;
  swoName: string;
  capabilityName: string;
  proficiencyLabel: string;
}

export type RolesPanelEntity = 'Department' | 'Role';

export interface RolesPanelState {
  open: boolean;
  mode: 'create' | 'edit';
  entity: RolesPanelEntity;
  data?: Department | IndustryRole;
}
