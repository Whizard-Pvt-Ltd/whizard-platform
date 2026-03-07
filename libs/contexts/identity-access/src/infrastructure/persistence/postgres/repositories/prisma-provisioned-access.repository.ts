import { getPrisma } from '@whizard/shared-infrastructure';
import type { ProvisionedAccessRepository } from '../../../../application/ports/repositories/provisioned-access.repository';
import type { ProvisionedAccessRecord } from '../orm/records';
import { toProvisionedAccessView } from '../mappers/provisioned-access.persistence.mapper';

export class PrismaProvisionedAccessRepository implements ProvisionedAccessRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<ProvisionedAccessRecord[]>(
      `select id, user_account_id as "userAccountId", tenant_type as "tenantType", tenant_id as "tenantId", provisioning_mode as "provisioningMode", lifecycle_status as "lifecycleStatus", created_at as "createdAt", activated_at as "activatedAt", deprovisioned_at as "deprovisionedAt"
       from iam_provisioned_access where id = $1 limit 1`,
      id
    );

    return rows.length ? toProvisionedAccessView(rows[0]) : null;
  }

  async save(access: Record<string, unknown>): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `insert into iam_provisioned_access (id, user_account_id, tenant_type, tenant_id, provisioning_mode, lifecycle_status, created_at, activated_at, deprovisioned_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set
         user_account_id = excluded.user_account_id,
         tenant_type = excluded.tenant_type,
         tenant_id = excluded.tenant_id,
         provisioning_mode = excluded.provisioning_mode,
         lifecycle_status = excluded.lifecycle_status,
         activated_at = excluded.activated_at,
         deprovisioned_at = excluded.deprovisioned_at`,
      String(access.id),
      String(access.userAccountId),
      String(access.tenantType),
      String(access.tenantId),
      String(access.provisioningMode),
      String(access.lifecycleStatus),
      new Date(String(access.createdAt ?? new Date().toISOString())),
      access.activatedAt ? new Date(String(access.activatedAt)) : null,
      access.deprovisionedAt ? new Date(String(access.deprovisionedAt)) : null
    );
  }
}
