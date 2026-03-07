import { assertUuidLike } from './validation.util';

export class AccessPrincipalId {
  private constructor(public readonly value: string) {}

  static from(value: string): AccessPrincipalId {
    return new AccessPrincipalId(assertUuidLike(value, 'AccessPrincipalId'));
  }
}
