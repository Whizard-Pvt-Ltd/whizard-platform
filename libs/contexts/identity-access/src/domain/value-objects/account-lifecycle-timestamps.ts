import { ValueObjectError } from './value-object.error';

export class AccountLifecycleTimestamps {
  private constructor(
    public readonly createdAt: Date,
    public readonly activatedAt: Date | null,
    public readonly lastLoginAt: Date | null
  ) {}

  static from(input: {
    createdAt: Date;
    activatedAt?: Date | null;
    lastLoginAt?: Date | null;
  }): AccountLifecycleTimestamps {
    if (input.activatedAt && input.activatedAt < input.createdAt) {
      throw new ValueObjectError('ActivatedAt cannot be before CreatedAt.');
    }

    if (input.lastLoginAt && input.lastLoginAt < input.createdAt) {
      throw new ValueObjectError('LastLoginAt cannot be before CreatedAt.');
    }

    return new AccountLifecycleTimestamps(
      input.createdAt,
      input.activatedAt ?? null,
      input.lastLoginAt ?? null
    );
  }
}
