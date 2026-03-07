import { assertNonEmpty } from './validation.util';

export class SsoMappingExpression {
  private constructor(public readonly value: string) {}

  static from(value: string): SsoMappingExpression {
    return new SsoMappingExpression(assertNonEmpty(value, 'SsoMappingExpression'));
  }
}
