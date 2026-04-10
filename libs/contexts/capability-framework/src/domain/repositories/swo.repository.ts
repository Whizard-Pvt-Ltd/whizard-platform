import type { SecondaryWorkObject } from '../aggregates/secondary-work-object.aggregate';
import type { ImpactLevelValue } from '../value-objects/impact-level.vo';

export interface SwoDto {
  id: string;
  tenantId: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
  isActive: boolean;
  canEdit: boolean;
}

export interface ISwoRepository {
  findById(id: string): Promise<SecondaryWorkObject | null>;
  findByPWO(pwoId: string): Promise<SecondaryWorkObject[]>;
  findByPWOWithTenants(pwoId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<SwoDto[]>;
  save(swo: SecondaryWorkObject): Promise<void>;
  delete(id: string): Promise<void>;
  hasCIs(swoId: string): Promise<boolean>;
}
