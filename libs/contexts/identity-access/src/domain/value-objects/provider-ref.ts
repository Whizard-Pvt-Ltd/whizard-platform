import { assertNonEmpty } from './validation.util';

export class ProviderRef {
  private constructor(public readonly value: string) {}

  static from(value: string): ProviderRef {
    return new ProviderRef(assertNonEmpty(value, 'ProviderRef'));
  }
}
