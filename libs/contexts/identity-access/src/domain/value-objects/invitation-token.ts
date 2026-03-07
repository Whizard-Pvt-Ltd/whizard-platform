import { assertNonEmpty } from './validation.util';

export class InvitationToken {
  private constructor(public readonly value: string) {}

  static from(value: string): InvitationToken {
    return new InvitationToken(assertNonEmpty(value, 'InvitationToken'));
  }
}
