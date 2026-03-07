import { getPrisma } from '@whizard/shared-infrastructure';
import type { IdentityProviderRepository } from '../../../../application/ports/repositories/identity-provider.repository';
import type { IdentityProviderRecord } from '../orm/records';
import { toIdentityProviderView } from '../mappers/identity-provider.persistence.mapper';

export class PrismaIdentityProviderRepository implements IdentityProviderRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<IdentityProviderRecord[]>(
      `select id, tenant_type as "tenantType", tenant_id as "tenantId", protocol_type as "protocolType", provider_name as "providerName", config_json as "configJson", status
       from iam_identity_providers where id = $1 limit 1`,
      id
    );

    return rows.length ? toIdentityProviderView(rows[0]) : null;
  }

  async save(provider: Record<string, unknown>): Promise<void> {
    const id = String(provider.id);
    await this.prisma.$executeRawUnsafe(
      `insert into iam_identity_providers (id, tenant_type, tenant_id, protocol_type, provider_name, config_json, status)
       values ($1,$2,$3,$4,$5,$6::jsonb,$7)
       on conflict (id) do update set
         tenant_type = excluded.tenant_type,
         tenant_id = excluded.tenant_id,
         protocol_type = excluded.protocol_type,
         provider_name = excluded.provider_name,
         config_json = excluded.config_json,
         status = excluded.status`,
      id,
      String(provider.tenantType ?? 'SYSTEM'),
      String(provider.tenantId ?? 'system'),
      String(provider.protocolType ?? 'OIDC'),
      String(provider.providerName ?? 'default'),
      JSON.stringify(provider.config ?? {}),
      String(provider.status ?? 'ACTIVE')
    );
  }
}
