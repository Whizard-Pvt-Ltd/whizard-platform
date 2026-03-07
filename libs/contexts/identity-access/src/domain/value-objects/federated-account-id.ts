import { assertUuidLike } from './validation.util';

export class FederatedAccountId {
  private constructor(public readonly value: string) {}

  static from(value: string): FederatedAccountId {
    return new FederatedAccountId(assertUuidLike(value, 'FederatedAccountId'));
  }
}
