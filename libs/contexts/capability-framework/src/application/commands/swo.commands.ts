import type { ImpactLevelValue } from '../../domain/value-objects/impact-level.vo';

export interface CreateSWOCommand {
  actorUserId?: string;
  tenantId: string;
  pwoId: string;
  name: string;
  description?: string;
  operationalComplexity: ImpactLevelValue;
  assetCriticality: ImpactLevelValue;
  failureFrequency: ImpactLevelValue;
}

export interface UpdateSWOCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  operationalComplexity?: ImpactLevelValue;
  assetCriticality?: ImpactLevelValue;
  failureFrequency?: ImpactLevelValue;
}

export interface DeactivateSWOCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
}
