import { assertOneOf } from './validation.util';

const MFA_REQUIREMENTS = ['NONE', 'OPTIONAL', 'REQUIRED'] as const;
export type MfaRequirementValue = (typeof MFA_REQUIREMENTS)[number];

export class MfaRequirement {
  private constructor(public readonly value: MfaRequirementValue) {}

  static from(value: string): MfaRequirement {
    return new MfaRequirement(assertOneOf(value, MFA_REQUIREMENTS, 'MfaRequirement'));
  }
}
