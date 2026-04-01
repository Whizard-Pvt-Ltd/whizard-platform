export type DomainType = 'Operations' | 'Maintenance' | 'Quality';
export type StrategicImportance = 1 | 2 | 3 | 4 | 5;

export interface ImpactLevelValue {
  label: string;
  value: number;
}

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
  domainType: DomainType;
}

export interface PrimaryWorkObject extends WrcfEntity {
  functionalGroupId: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
}

export interface SecondaryWorkObject extends WrcfEntity {
  pwoId: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
}

export interface Capability extends WrcfEntity {}

export interface ProficiencyLevel extends WrcfEntity {
  level: string;
}

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

export interface CapabilityInstance {
  id: string;
  functionalGroupId: string;
  pwoId?: string;
  pwoName?: string;
  swoId?: string;
  swoName?: string;
  capabilityId: string;
  capabilityCode: string;
  capabilityName: string;
  proficiencyId: string;
  proficiencyLevel: string;
  proficiencyLabel: string;
}

export interface CIPendingEntry {
  localId: string;
  industryId: string;
  fgId: string;
  fgName: string;
  pwoId?: string;
  pwoName?: string;
  swoId?: string;
  swoName?: string;
  capabilityId: string;
  capabilityCode: string;
  capabilityName: string;
  proficiencyId: string;
  proficiencyLevel: string;
  proficiencyLabel: string;
}
