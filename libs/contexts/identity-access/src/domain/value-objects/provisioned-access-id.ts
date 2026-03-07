import { assertUuidLike } from './validation.util';

export class ProvisionedAccessId {
  private constructor(public readonly value: string) {}

  static from(value: string): ProvisionedAccessId {
    return new ProvisionedAccessId(assertUuidLike(value, 'ProvisionedAccessId'));
  }
}
