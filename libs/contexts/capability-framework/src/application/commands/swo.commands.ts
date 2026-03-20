import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';

export interface CreateSWOCommand {
  tenantId: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
}

export interface UpdateSWOCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  operationalComplexity?: ImpactLevelValue;
  assetCriticality?: ImpactLevelValue;
  failureFrequency?: ImpactLevelValue;
}

export interface DeactivateSWOCommand {
  id: string;
  tenantId: string;
}
