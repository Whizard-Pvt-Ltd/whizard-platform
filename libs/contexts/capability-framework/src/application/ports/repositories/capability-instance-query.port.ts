import type { CapabilityInstanceDto } from '../../dto/capability-instance.dto';

export interface ICapabilityInstanceQueryPort {
  findByContextWithDetails(tenantId: string, industryId?: string, fgId?: string): Promise<CapabilityInstanceDto[]>;
}
