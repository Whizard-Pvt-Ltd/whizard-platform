import { IamDomainError } from '../exceptions/iam-domain.error';

export class EmailAddress {
  private constructor(public readonly value: string) {}

  static create(value: string): EmailAddress {
    const normalized = value.trim().toLowerCase();

    if (!normalized.includes('@') || normalized.startsWith('@') || normalized.endsWith('@')) {
      throw new IamDomainError('Invalid email address.');
    }

    return new EmailAddress(normalized);
  }
}
