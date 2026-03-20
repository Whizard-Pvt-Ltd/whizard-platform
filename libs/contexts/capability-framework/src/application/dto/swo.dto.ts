import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';

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
}
