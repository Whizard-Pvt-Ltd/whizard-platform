import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';
import type { StrategicImportance } from '../../domain/value-objects/strategic-importance.vo';

export interface PwoDto {
  id: string;
  tenantId: string;
  functionalGroupId: string;
  name: string;
  description?: string;
  strategicImportance: StrategicImportance;
  revenueImpact: ImpactLevelValue;
  downtimeSensitivity: ImpactLevelValue;
  isActive: boolean;
}
