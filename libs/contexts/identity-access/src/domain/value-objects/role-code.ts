import { assertNonEmpty } from './validation.util';

export class RoleCode {
  private constructor(public readonly value: string) {}

  static from(value: string): RoleCode {
    return new RoleCode(assertNonEmpty(value, 'RoleCode').toUpperCase());
  }
}
