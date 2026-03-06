import { randomUUID } from 'node:crypto';

export class SessionId {
  private constructor(public readonly value: string) {}

  static create(value?: string): SessionId {
    return new SessionId(value ?? randomUUID());
  }
}
