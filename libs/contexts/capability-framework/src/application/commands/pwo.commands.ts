import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';
import type { StrategicImportance } from '../../domain/value-objects/strategic-importance.vo';

export interface CreatePWOCommand {
  tenantId: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
}

export interface UpdatePWOCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  strategicImportance?: StrategicImportance;
  revenueImpact?: ImpactLevelValue;
  downtimeSensitivity?: ImpactLevelValue;
}

export interface DeactivatePWOCommand {
  id: string;
  tenantId: string;
}
