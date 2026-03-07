import { assertUuidLike } from './validation.util';

export class SessionId {
  private constructor(public readonly value: string) {}

  static from(value: string): SessionId {
    return new SessionId(assertUuidLike(value, 'SessionId'));
  }
}
