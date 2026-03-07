import { assertNonEmpty } from './validation.util';

export class LoginId {
  private constructor(public readonly value: string) {}

  static from(value: string): LoginId {
    return new LoginId(assertNonEmpty(value, 'LoginId').toLowerCase());
  }
}
