export interface WrcfEntity {
  id: string;
  name: string;
  description?: string;
  code?: string;
}

export interface IndustrySector extends WrcfEntity {}

export interface Industry extends WrcfEntity {
  sectorId: string;
}

export interface FunctionalGroup extends WrcfEntity {
  industryId: string;
}

export interface PrimaryWorkObject extends WrcfEntity {
  functionalGroupId: string;
}

export interface SecondaryWorkObject extends WrcfEntity {
  primaryWorkObjectId: string;
  strategicImportance: string;
  revenueLink: string;
  downtimeSensitivity: string;
  riskWeight: string;
  dependencyLinks: string;
}

export interface Capability extends WrcfEntity {}

export interface ProficiencyLevel extends WrcfEntity {}

export type EntityType = 'FG' | 'PWO' | 'SWO';

export interface PanelState {
  open: boolean;
  mode: 'create' | 'edit';
  entityType: EntityType;
  data?: FunctionalGroup | PrimaryWorkObject | SecondaryWorkObject;
}

export interface DeleteResult {
  success: boolean;
  reason?: string;
}
