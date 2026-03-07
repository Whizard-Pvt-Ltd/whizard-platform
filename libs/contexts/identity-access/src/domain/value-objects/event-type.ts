import { assertNonEmpty } from './validation.util';

export class EventType {
  private constructor(public readonly value: string) {}

  static from(value: string): EventType {
    return new EventType(assertNonEmpty(value, 'EventType'));
  }
}
