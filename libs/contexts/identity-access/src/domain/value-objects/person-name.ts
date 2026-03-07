import { assertNonEmpty } from './validation.util';

export class PersonName {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string
  ) {}

  static from(input: { firstName: string; lastName: string }): PersonName {
    return new PersonName(
      assertNonEmpty(input.firstName, 'FirstName'),
      assertNonEmpty(input.lastName, 'LastName')
    );
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
