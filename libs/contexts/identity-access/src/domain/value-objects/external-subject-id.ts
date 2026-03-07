import { assertNonEmpty } from './validation.util';

export class ExternalSubjectId {
  private constructor(public readonly value: string) {}

  static from(value: string): ExternalSubjectId {
    return new ExternalSubjectId(assertNonEmpty(value, 'ExternalSubjectId'));
  }
}
