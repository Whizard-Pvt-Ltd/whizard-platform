import { assertOneOf } from './validation.util';

const SOURCES = ['SYSTEM', 'USER', 'SSO', 'INTEGRATION'] as const;
export type EventSourceValue = (typeof SOURCES)[number];

export class EventSource {
  private constructor(public readonly value: EventSourceValue) {}

  static from(value: string): EventSource {
    return new EventSource(assertOneOf(value, SOURCES, 'EventSource'));
  }
}
