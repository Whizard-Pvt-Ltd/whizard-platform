import { assertOneOf } from './validation.util';

const STATUSES = ['INVITED', 'ACTIVE', 'SUSPENDED', 'DEPROVISIONED'] as const;
export type LifecycleStatusValue = (typeof STATUSES)[number];

export class LifecycleStatus {
  private constructor(public readonly value: LifecycleStatusValue) {}

  static from(value: string): LifecycleStatus {
    return new LifecycleStatus(assertOneOf(value, STATUSES, 'LifecycleStatus'));
  }
}
