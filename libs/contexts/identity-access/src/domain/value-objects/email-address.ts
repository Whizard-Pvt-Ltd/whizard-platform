import { assertNonEmpty } from './validation.util';
import { ValueObjectError } from './value-object.error';

export class EmailAddress {
  private constructor(public readonly value: string) {}

  static from(value: string): EmailAddress {
    const normalized = assertNonEmpty(value, 'EmailAddress').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new ValueObjectError('EmailAddress must be a valid email.');
    }
    return new EmailAddress(normalized);
  }
}
