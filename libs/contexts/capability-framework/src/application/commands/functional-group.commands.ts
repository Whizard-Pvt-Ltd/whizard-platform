import type { DomainType } from '../../domain/value-objects/domain-type.vo';

export interface CreateFGCommand {
  tenantId: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
}

export interface UpdateFGCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  domainType?: DomainType;
}

export interface DeactivateFGCommand {
  id: string;
  tenantId: string;
}
