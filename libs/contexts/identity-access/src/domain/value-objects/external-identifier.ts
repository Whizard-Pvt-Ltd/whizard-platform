import { assertNonEmpty } from './validation.util';

export class ExternalIdentifier {
  private constructor(public readonly value: string) {}

  static from(value: string): ExternalIdentifier {
    return new ExternalIdentifier(assertNonEmpty(value, 'ExternalIdentifier'));
  }
}
