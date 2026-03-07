import { assertOneOf } from './validation.util';

const ACCESS_DECISIONS = ['ALLOW', 'DENY'] as const;
export type AccessDecisionValue = (typeof ACCESS_DECISIONS)[number];

export class AccessDecision {
  private constructor(public readonly value: AccessDecisionValue) {}

  static allow(): AccessDecision {
    return new AccessDecision('ALLOW');
  }

  static deny(): AccessDecision {
    return new AccessDecision('DENY');
  }

  static from(value: string): AccessDecision {
    return new AccessDecision(assertOneOf(value, ACCESS_DECISIONS, 'AccessDecision'));
  }
}
