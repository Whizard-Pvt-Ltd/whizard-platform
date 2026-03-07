import type { PasswordVerifierGateway } from '../../application/ports/gateways/password-verifier.gateway';
import { PasswordHasherService } from './password-hasher.service';

export class BcryptPasswordVerifierGateway implements PasswordVerifierGateway {
  constructor(private readonly hasher: PasswordHasherService = new PasswordHasherService()) {}

  async verify(plainTextPassword: string, storedHash: string): Promise<boolean> {
    return this.hasher.verify(plainTextPassword, storedHash);
  }
}
