import { getPrisma } from '@whizard/shared-infrastructure';
import type { IamReadModelRepository } from '../../../../application/ports/repositories/iam-read-model.repository';

export class PrismaIamReadModelRepository implements IamReadModelRepository {
  private readonly prisma = getPrisma();

  async getCurrentUserProfile(userAccountId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id, primary_email, status, tenant_type, tenant_id from iam_user_accounts where id = $1 limit 1`,
      userAccountId
    );
    return rows[0] ?? null;
  }

  async getMySessions(userAccountId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id, status, issued_at, last_activity_at, expires_at from iam_user_sessions where user_account_id = $1 order by issued_at desc`,
      userAccountId
    );
  }

  async getTenantMemberships(userAccountId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id, tenant_type, tenant_id, status, joined_at from iam_tenant_memberships where user_account_id = $1 order by joined_at desc`,
      userAccountId
    );
  }

  async getMyAccessGrants(userAccountId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select pg.id, pg.permission_code, pg.grant_source, pg.scope_type, pg.scope_value
       from iam_permission_grants pg
       join iam_access_principals ap on ap.id = pg.access_principal_id
       where ap.user_account_id = $1 and pg.revoked_at is null`,
      userAccountId
    );
  }

  async getUserAccessAdministrationView(tenantType: string, tenantId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select ap.id as access_principal_id, ap.user_account_id, ap.status, ua.primary_email
       from iam_access_principals ap
       join iam_user_accounts ua on ua.id = ap.user_account_id
       where ap.tenant_type = $1 and ap.tenant_id = $2`,
      tenantType,
      tenantId
    );
  }

  async getIdentityProviderConfig(providerId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id, protocol_type, provider_name, config_json, status from iam_identity_providers where id = $1 limit 1`,
      providerId
    );
    return rows[0] ?? null;
  }

  async getPendingInvitations(tenantType: string, tenantId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select i.id, i.invitee_email, i.status, i.expires_at
       from iam_invitations i
       join iam_provisioned_access pa on pa.id = i.provisioned_access_id
       where pa.tenant_type = $1 and pa.tenant_id = $2 and i.status = 'PENDING'`,
      tenantType,
      tenantId
    );
  }

  async getProvisioningTimeline(provisionedAccessId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id, event_type, event_source, payload_json, occurred_at, outcome
       from iam_provisioning_events
       where provisioned_access_id = $1
       order by occurred_at desc`,
      provisionedAccessId
    );
  }
}
