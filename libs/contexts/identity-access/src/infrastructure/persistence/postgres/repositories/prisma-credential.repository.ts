import { getPrisma } from '@whizard/shared-infrastructure';
import type { CredentialRepository } from '../../../../application/ports/repositories/credential.repository';
import type { Credential } from '../../../../domain/entities/credential.entity';

export class PrismaCredentialRepository implements CredentialRepository {
  private readonly prisma = getPrisma();

  async findActiveByUserAccountId(userAccountId: string): Promise<Credential | null> {
    const record = await this.prisma.userCredential.findUnique({
      where: { userAccountId }
    });

    if (!record) {
      return null;
    }

    // Map UserCredential table to Credential domain interface
    return {
      userAccountId: record.userAccountId,
      passwordHash: record.passwordHash,
      hashAlgorithm: 'scrypt', // Default to scrypt as per our password hasher
      status: 'ACTIVE', // Simplified - we just check if record exists
      failedAttempts: 0, // Not tracked in current schema
      lockedUntil: null // Not tracked in current schema
    };
  }
}
