import { ValueObjectError } from './value-object.error';

export class ConcurrencyPolicy {
  private constructor(public readonly maxConcurrentSessions: number) {}

  static from(maxConcurrentSessions: number): ConcurrencyPolicy {
    if (!Number.isInteger(maxConcurrentSessions) || maxConcurrentSessions < 1) {
      throw new ValueObjectError('ConcurrencyPolicy must allow at least 1 session.');
    }
    return new ConcurrencyPolicy(maxConcurrentSessions);
  }
}
