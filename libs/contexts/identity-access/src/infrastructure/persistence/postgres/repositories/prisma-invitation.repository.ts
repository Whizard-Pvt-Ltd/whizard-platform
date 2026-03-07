import { getPrisma } from '@whizard/shared-infrastructure';
import type { InvitationRepository } from '../../../../application/ports/repositories/invitation.repository';
import type { InvitationRecord } from '../orm/records';
import { toInvitationView } from '../mappers/invitation.persistence.mapper';

export class PrismaInvitationRepository implements InvitationRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.$queryRawUnsafe<InvitationRecord[]>(
      `select id, provisioned_access_id as "provisionedAccessId", invited_by as "invitedBy", invitee_email as "inviteeEmail", token_hash as "tokenHash", status, expires_at as "expiresAt", accepted_at as "acceptedAt"
       from iam_invitations where id = $1 limit 1`,
      id
    );

    return rows.length ? toInvitationView(rows[0]) : null;
  }

  async save(invitation: Record<string, unknown>): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `insert into iam_invitations (id, provisioned_access_id, invited_by, invitee_email, token_hash, status, expires_at, accepted_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (id) do update set
         status = excluded.status,
         accepted_at = excluded.accepted_at,
         expires_at = excluded.expires_at`,
      String(invitation.id),
      String(invitation.provisionedAccessId),
      String(invitation.invitedBy),
      String(invitation.inviteeEmail),
      String(invitation.tokenHash),
      String(invitation.status ?? 'PENDING'),
      new Date(String(invitation.expiresAt)),
      invitation.acceptedAt ? new Date(String(invitation.acceptedAt)) : null
    );
  }
}
