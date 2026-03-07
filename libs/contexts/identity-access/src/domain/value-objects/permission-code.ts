import { assertNonEmpty } from './validation.util';

export class PermissionCode {
  private constructor(public readonly value: string) {}

  static from(value: string): PermissionCode {
    return new PermissionCode(assertNonEmpty(value, 'PermissionCode').toUpperCase());
  }
}
