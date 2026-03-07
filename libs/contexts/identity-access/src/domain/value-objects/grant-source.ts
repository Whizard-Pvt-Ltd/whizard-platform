import { assertOneOf } from './validation.util';

const SOURCES = ['ROLE', 'DIRECT', 'FEDERATION', 'SYSTEM'] as const;
export type GrantSourceValue = (typeof SOURCES)[number];

export class GrantSource {
  private constructor(public readonly value: GrantSourceValue) {}

  static from(value: string): GrantSource {
    return new GrantSource(assertOneOf(value, SOURCES, 'GrantSource'));
  }
}
