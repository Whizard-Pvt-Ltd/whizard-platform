export class InternshipNotFoundException extends Error {
  readonly name = 'DomainException';
  constructor(id: string) {
    super(`Internship not found: ${id}`);
  }
}
