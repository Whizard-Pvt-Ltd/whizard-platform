import { assertUuidLike } from './validation.util';

export class UserAccountId {
  private constructor(public readonly value: string) {}

  static from(value: string): UserAccountId {
    return new UserAccountId(assertUuidLike(value, 'UserAccountId'));
  }
}
