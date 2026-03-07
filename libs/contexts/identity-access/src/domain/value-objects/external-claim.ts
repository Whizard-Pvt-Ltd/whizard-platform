import { assertNonEmpty } from './validation.util';

export class ExternalClaim {
  private constructor(
    public readonly claimName: string,
    public readonly claimValue: string
  ) {}

  static from(input: { claimName: string; claimValue: string }): ExternalClaim {
    return new ExternalClaim(
      assertNonEmpty(input.claimName, 'ExternalClaimName'),
      assertNonEmpty(input.claimValue, 'ExternalClaimValue')
    );
  }
}
