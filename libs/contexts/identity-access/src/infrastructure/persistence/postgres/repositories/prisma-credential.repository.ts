import { getPrisma } from '@whizard/shared-infrastructure';
import type { CredentialRepository } from '../../../../application/ports/repositories/credential.repository';
import type { Credential } from '../../../../domain/entities/credential.entity';
import { toCredentialDomain } from '../mappers/credential.persistence.mapper';

export class PrismaCredentialRepository implements CredentialRepository {
  private readonly prisma = getPrisma();

  async findActiveByUserAccountId(userAccountId: string): Promise<Credential | null> {
    const row = await this.prisma.credential.findFirst({
      where: {
        userAccountId,
        status: 'ACTIVE'
      },
      orderBy: {
        passwordChangedAt: 'desc'
      }
    });

    return row ? toCredentialDomain(row) : null;
  }
}
