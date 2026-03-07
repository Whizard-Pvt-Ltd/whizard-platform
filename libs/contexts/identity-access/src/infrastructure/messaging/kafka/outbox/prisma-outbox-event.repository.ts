import { getPrisma } from '@whizard/shared-infrastructure';
import type { OutboxDispatchEvent, OutboxEventRepository } from './outbox-event.repository';

interface OutboxRow {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  retryCount: number;
}

export class PrismaOutboxEventRepository implements OutboxEventRepository {
  private readonly prisma = getPrisma();

  async pullPending(limit: number): Promise<readonly OutboxDispatchEvent[]> {
    const rows = await this.prisma.$queryRawUnsafe<OutboxRow[]>(
      `select
         id,
         event_type as "eventType",
         aggregate_type as "aggregateType",
         aggregate_id as "aggregateId",
         payload,
         occurred_at as "occurredAt",
         retry_count as "retryCount"
       from iam.outbox_events
       where status = 'PENDING'
       order by occurred_at asc
       limit $1`,
      limit
    );

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType,
      aggregateType: row.aggregateType,
      aggregateId: row.aggregateId,
      payload: row.payload,
      occurredAt: row.occurredAt.toISOString(),
      retryCount: row.retryCount
    }));
  }

  async markPublished(eventId: string, publishedAt: Date): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `update iam.outbox_events
       set status = 'PUBLISHED', published_at = $2
       where id = $1 and status = 'PENDING'`,
      eventId,
      publishedAt
    );
  }

  async markFailed(eventId: string, reason: string, failedAt: Date): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `update iam.outbox_events
       set status = 'FAILED',
           failed_at = $2,
           retry_count = retry_count + 1,
           error_message = left($3, 1000)
       where id = $1 and status = 'PENDING'`,
      eventId,
      failedAt,
      reason
    );
  }

  async requeueFailed(maxRetryCount: number): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `with updated as (
         update iam.outbox_events
         set status = 'PENDING', failed_at = null, error_message = null
         where status = 'FAILED' and retry_count < $1
         returning 1
       )
       select count(*)::int as count from updated`,
      maxRetryCount
    );

    return result[0]?.count ?? 0;
  }
}
