import type { SecondaryWorkObject } from '../aggregates/secondary-work-object.aggregate';

export interface ISwoRepository {
  findById(id: string): Promise<SecondaryWorkObject | null>;
  findByPWO(pwoId: string, tenantId: string): Promise<SecondaryWorkObject[]>;
  save(swo: SecondaryWorkObject): Promise<void>;
  delete(id: string): Promise<void>;
}
