import type { PrimaryWorkObject } from '../aggregates/primary-work-object.aggregate';
import type { ImpactLevelValue } from '../value-objects/impact-level.vo';
import type { StrategicImportance } from '../value-objects/strategic-importance.vo';

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
  canEdit: boolean;
}

export interface IPwoRepository {
  findById(id: string): Promise<PrimaryWorkObject | null>;
  findByFG(fgId: string): Promise<PrimaryWorkObject[]>;
  findByFGWithTenants(fgId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<PwoDto[]>;
  save(pwo: PrimaryWorkObject): Promise<void>;
  delete(id: string): Promise<void>;
  hasSWOs(pwoId: string): Promise<boolean>;
}
