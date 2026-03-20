import type { ICapabilityRepository } from '../../domain/repositories/capability.repository';
import type { CapabilityDto } from '../dto/capability.dto';

export class ListCapabilitiesQueryHandler {
  constructor(private readonly capabilityRepo: ICapabilityRepository) {}

  async execute(): Promise<CapabilityDto[]> {
    const caps = await this.capabilityRepo.findAll();
    return caps.filter(c => c.isActive).map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      type: c.type,
      isActive: c.isActive
    }));
  }
}
