import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';
import type { StrategicImportance } from '../../domain/value-objects/strategic-importance.vo';

export interface CreatePWOCommand {
  actorUserId?: string;
  tenantId: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
}

export interface UpdatePWOCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  strategicImportance?: StrategicImportance;
  revenueImpact?: ImpactLevelValue;
  downtimeSensitivity?: ImpactLevelValue;
}

export interface DeactivatePWOCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
}
