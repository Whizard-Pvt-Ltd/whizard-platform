import type { FunctionalGroup } from '../aggregates/functional-group.aggregate';

export interface IFunctionalGroupRepository {
  findById(id: string): Promise<FunctionalGroup | null>;
  findByIndustry(industryId: string, tenantId: string): Promise<FunctionalGroup[]>;
  save(fg: FunctionalGroup): Promise<void>;
  delete(id: string): Promise<void>;
  hasPWOs(fgId: string): Promise<boolean>;
}
