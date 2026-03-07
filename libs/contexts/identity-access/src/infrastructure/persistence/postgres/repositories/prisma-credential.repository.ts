import { getPrisma } from '@whizard/shared-infrastructure';
import type { CredentialRepository } from '../../../../application/ports/repositories/credential.repository';
import type { Credential } from '../../../../domain/entities/credential.entity';
import { toCredentialDomain } from '../mappers/credential.persistence.mapper';
import type { CredentialRecord } from '../orm/records';

export class PrismaCredentialRepository implements CredentialRepository {
  private readonly prisma = getPrisma();

  async findActiveByUserAccountId(userAccountId: string): Promise<Credential | null> {
    const rows = await this.prisma.$queryRawUnsafe<CredentialRecord[]>(
      `select id, user_account_id as "userAccountId", password_hash as "passwordHash", hash_algo as "hashAlgo", status, failed_attempts as "failedAttempts", locked_until as "lockedUntil", password_changed_at as "passwordChangedAt"
       from iam.credentials
       where user_account_id = $1 and status = 'ACTIVE'
       order by password_changed_at desc
       limit 1`,
      userAccountId
    );

    return rows[0] ? toCredentialDomain(rows[0]) : null;
  }
}
