import { assertOneOf } from './validation.util';

const SESSION_STATUSES = ['ACTIVE', 'REVOKED', 'EXPIRED'] as const;
export type SessionStatusValue = (typeof SESSION_STATUSES)[number];

export class SessionStatus {
  private constructor(public readonly value: SessionStatusValue) {}

  static from(value: string): SessionStatus {
    return new SessionStatus(assertOneOf(value, SESSION_STATUSES, 'SessionStatus'));
  }
}
