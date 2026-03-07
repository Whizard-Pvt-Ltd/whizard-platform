import { getPrisma } from '@whizard/shared-infrastructure';
import type { FederatedAccountRepository } from '../../../../application/ports/repositories/federated-account.repository';
import type { FederatedAccountRecord } from '../orm/records';
import { toFederatedAccountView } from '../mappers/federated-account.persistence.mapper';

export class PrismaFederatedAccountRepository implements FederatedAccountRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<FederatedAccountRecord[]>(
      `select id, user_account_id as "userAccountId", identity_provider_id as "identityProviderId", external_subject_id as "externalSubjectId", status, linked_at as "linkedAt"
       from iam_federated_accounts where id = $1 limit 1`,
      id
    );

    return rows.length ? toFederatedAccountView(rows[0]) : null;
  }

  async save(account: Record<string, unknown>): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `insert into iam_federated_accounts (id, user_account_id, identity_provider_id, external_subject_id, status, linked_at)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set
         user_account_id = excluded.user_account_id,
         identity_provider_id = excluded.identity_provider_id,
         external_subject_id = excluded.external_subject_id,
         status = excluded.status`,
      String(account.id),
      String(account.userAccountId),
      String(account.identityProviderId),
      String(account.externalSubjectId),
      String(account.status ?? 'LINKED'),
      new Date(String(account.linkedAt ?? new Date().toISOString()))
    );
  }
}
