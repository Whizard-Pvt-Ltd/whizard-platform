import type { CapabilityInstance } from '../aggregates/capability-instance.aggregate';

export interface ICapabilityInstanceRepository {
  findByContext(tenantId: string, fgId?: string, pwoId?: string, swoId?: string): Promise<CapabilityInstance[]>;
  findById(id: string): Promise<CapabilityInstance | null>;
  save(ci: CapabilityInstance): Promise<void>;
  delete(id: string): Promise<void>;
}
