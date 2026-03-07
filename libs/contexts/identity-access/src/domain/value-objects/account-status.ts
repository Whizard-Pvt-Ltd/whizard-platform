import { assertOneOf } from './validation.util';

const ACCOUNT_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED'] as const;
export type AccountStatusValue = (typeof ACCOUNT_STATUSES)[number];

export class AccountStatus {
  private constructor(public readonly value: AccountStatusValue) {}

  static from(value: string): AccountStatus {
    return new AccountStatus(assertOneOf(value, ACCOUNT_STATUSES, 'AccountStatus'));
  }
}
