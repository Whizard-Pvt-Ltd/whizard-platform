import type { Capability } from '../entities/capability.entity';

export interface ICapabilityRepository {
  findAll(): Promise<Capability[]>;
  findById(id: string): Promise<Capability | null>;
}
