import { ValueObjectError } from './value-object.error';

export class SessionTimeWindow {
  private constructor(
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly refreshExpiresAt: Date
  ) {}

  static from(input: { issuedAt: Date; expiresAt: Date; refreshExpiresAt: Date }): SessionTimeWindow {
    if (input.expiresAt <= input.issuedAt) {
      throw new ValueObjectError('Session expiresAt must be after issuedAt.');
    }
    if (input.refreshExpiresAt <= input.expiresAt) {
      throw new ValueObjectError('Session refreshExpiresAt must be after expiresAt.');
    }
    return new SessionTimeWindow(input.issuedAt, input.expiresAt, input.refreshExpiresAt);
  }
}
