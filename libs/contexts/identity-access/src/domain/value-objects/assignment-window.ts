import { ValueObjectError } from './value-object.error';

export class AssignmentWindow {
  private constructor(
    public readonly validFrom: Date,
    public readonly validTo: Date | null
  ) {}

  static from(input: { validFrom: Date; validTo?: Date | null }): AssignmentWindow {
    if (input.validTo && input.validTo < input.validFrom) {
      throw new ValueObjectError('Assignment validTo cannot be before validFrom.');
    }
    return new AssignmentWindow(input.validFrom, input.validTo ?? null);
  }
}
