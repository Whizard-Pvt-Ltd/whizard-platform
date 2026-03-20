import type { PrimaryWorkObject } from '../aggregates/primary-work-object.aggregate';

export interface IPwoRepository {
  findById(id: string): Promise<PrimaryWorkObject | null>;
  findByFG(fgId: string, tenantId: string): Promise<PrimaryWorkObject[]>;
  save(pwo: PrimaryWorkObject): Promise<void>;
  delete(id: string): Promise<void>;
  hasSWOs(pwoId: string): Promise<boolean>;
}
