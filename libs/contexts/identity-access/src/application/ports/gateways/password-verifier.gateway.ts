export interface PasswordVerifierGateway {
  verify(plainTextPassword: string, storedHash: string): Promise<boolean>;
}
