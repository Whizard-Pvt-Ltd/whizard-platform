export class IamDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IamDomainError';
  }
}
