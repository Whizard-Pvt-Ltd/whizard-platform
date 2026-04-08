import type { CapabilityInstanceDto } from '../dto/capability-instance.dto';
import type { ICapabilityInstanceQueryPort } from '../ports/repositories/capability-instance-query.port';

export class ListCapabilityInstancesQueryHandler {
  constructor(private readonly ciQueryPort: ICapabilityInstanceQueryPort) {}

  async execute(industryId?: string, fgId?: string): Promise<CapabilityInstanceDto[]> {
    return this.ciQueryPort.findByContextWithDetails(industryId, fgId);
  }
}
