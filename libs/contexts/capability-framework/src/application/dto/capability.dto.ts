import type { CapabilityType } from '../../domain/value-objects/capability-type.vo';

export interface CapabilityDto {
  id: string;
  code: string;
  name: string;
  type: CapabilityType;
  isActive: boolean;
}
