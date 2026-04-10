import type { CapabilityInstanceDto } from '../dto/capability-instance.dto';
import type { ICapabilityInstanceQueryPort } from '../ports/repositories/capability-instance-query.port';

export class ListCapabilityInstancesQueryHandler {
  constructor(private readonly repo: ICapabilityInstanceQueryPort) {}

  async execute(industryId?: string, fgId?: string, tenantIds?: string[], ownedTenantIds?: string[]): Promise<CapabilityInstanceDto[]> {
    return this.repo.findByContextWithDetails(industryId, fgId, tenantIds, ownedTenantIds);
  }
}
