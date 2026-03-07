import { ValueObjectError } from './value-object.error';

export class InviteWindow {
  private constructor(
    public readonly issuedAt: Date,
    public readonly expiresAt: Date
  ) {}

  static from(input: { issuedAt: Date; expiresAt: Date }): InviteWindow {
    if (input.expiresAt <= input.issuedAt) {
      throw new ValueObjectError('InviteWindow expiresAt must be after issuedAt.');
    }
    return new InviteWindow(input.issuedAt, input.expiresAt);
  }
}
