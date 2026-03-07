import { assertOneOf } from './validation.util';

const STATUSES = ['PENDING', 'LINKED', 'FAILED', 'DISABLED'] as const;
export type FederationStatusValue = (typeof STATUSES)[number];

export class FederationStatus {
  private constructor(public readonly value: FederationStatusValue) {}

  static from(value: string): FederationStatus {
    return new FederationStatus(assertOneOf(value, STATUSES, 'FederationStatus'));
  }
}
