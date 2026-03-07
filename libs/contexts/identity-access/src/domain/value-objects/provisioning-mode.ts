import { assertOneOf } from './validation.util';

const MODES = ['MANUAL', 'SSO', 'SCIM', 'BULK_IMPORT'] as const;
export type ProvisioningModeValue = (typeof MODES)[number];

export class ProvisioningMode {
  private constructor(public readonly value: ProvisioningModeValue) {}

  static from(value: string): ProvisioningMode {
    return new ProvisioningMode(assertOneOf(value, MODES, 'ProvisioningMode'));
  }
}
