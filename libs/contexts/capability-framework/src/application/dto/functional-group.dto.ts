import type { DomainType } from '../../domain/value-objects/domain-type.vo';

export interface FunctionalGroupDto {
  id: string;
  tenantId: string;
  industryId: string;
  name: string;
  description?: string;
  domainType: DomainType;
  isActive: boolean;
}
