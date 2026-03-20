import type { CapabilityType } from '../value-objects/capability-type.vo';

export interface CapabilityProps {
  id: string;
  code: string;
  name: string;
  type: CapabilityType;
  isActive: boolean;
}

export class Capability {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: CapabilityType;
  readonly isActive: boolean;

  constructor(props: CapabilityProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.type = props.type;
    this.isActive = props.isActive;
  }
}
