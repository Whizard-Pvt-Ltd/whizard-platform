import { ValueObjectError } from './value-object.error';

export class InactivityTimeoutPolicy {
  private constructor(public readonly timeoutMinutes: number) {}

  static from(timeoutMinutes: number): InactivityTimeoutPolicy {
    if (!Number.isInteger(timeoutMinutes) || timeoutMinutes < 1) {
      throw new ValueObjectError('InactivityTimeoutPolicy must be >= 1 minute.');
    }
    return new InactivityTimeoutPolicy(timeoutMinutes);
  }
}
