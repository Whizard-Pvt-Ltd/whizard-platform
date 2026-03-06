import { randomUUID } from 'node:crypto';

export class UserAccountId {
  private constructor(public readonly value: string) {}

  static create(value?: string): UserAccountId {
    return new UserAccountId(value ?? randomUUID());
  }
}
