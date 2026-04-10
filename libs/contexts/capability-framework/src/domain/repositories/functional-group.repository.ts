import type { FunctionalGroup } from '../aggregates/functional-group.aggregate';
import type { DomainType } from '../value-objects/domain-type.vo';

export interface FunctionalGroupDto {
  id: string;
  tenantId: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
  isActive: boolean;
  canEdit: boolean;
}

export interface IFunctionalGroupRepository {
  findById(id: string): Promise<FunctionalGroup | null>;
  findByIndustry(industryId: string): Promise<FunctionalGroup[]>;
  findByIndustryWithTenants(industryId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<FunctionalGroupDto[]>;
  existsByName(name: string, industryId: string, tenantId: string): Promise<boolean>;
  save(fg: FunctionalGroup): Promise<void>;
  delete(id: string): Promise<void>;
  hasPWOs(fgId: string): Promise<boolean>;
}
