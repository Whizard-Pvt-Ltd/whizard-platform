import type { DomainType } from '../../domain/value-objects/domain-type.vo';

export interface CreateFGCommand {
  actorUserId?: string;
  tenantId: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
}

export interface UpdateFGCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  domainType?: DomainType;
}

export interface DeactivateFGCommand {
  actorUserId?: string;
  id: string;
  tenantId: string;
}
