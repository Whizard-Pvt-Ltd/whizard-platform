import { ValueObjectError } from './value-object.error';

export class RoleHierarchyLevel {
  private constructor(public readonly value: number) {}

  static from(value: number): RoleHierarchyLevel {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValueObjectError('RoleHierarchyLevel must be a non-negative integer.');
    }
    return new RoleHierarchyLevel(value);
  }
}
