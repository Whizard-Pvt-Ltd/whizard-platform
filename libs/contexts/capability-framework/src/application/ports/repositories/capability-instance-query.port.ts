import type { CapabilityInstanceDto } from '../../dto/capability-instance.dto';

export interface ICapabilityInstanceQueryPort {
  findByContextWithDetails(industryId?: string, fgId?: string, tenantIds?: string[], ownedTenantIds?: string[]): Promise<CapabilityInstanceDto[]>;
}
