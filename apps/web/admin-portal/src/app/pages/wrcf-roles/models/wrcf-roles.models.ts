export interface Department {
  id: string;
  name: string;
  industryId: string;
  fgIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
}

export interface IndustryRole {
  id: string;
  name: string;
  departmentId: string;
  seniorityLevel: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
}

export interface PendingCIMapping {
  ciId: string;
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
