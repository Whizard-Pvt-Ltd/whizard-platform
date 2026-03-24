import type { ICapabilityInstanceQueryPort } from '../ports/repositories/capability-instance-query.port';
import type { CapabilityInstanceDto } from '../dto/capability-instance.dto';

export class ListCapabilityInstancesQueryHandler {
  constructor(private readonly ciQueryPort: ICapabilityInstanceQueryPort) {}

  async execute(tenantId: string, industryId?: string, fgId?: string): Promise<CapabilityInstanceDto[]> {
    return this.ciQueryPort.findByContextWithDetails(tenantId, industryId, fgId);
  }
}
