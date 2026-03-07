import { randomUUID } from 'node:crypto';
import { getPrisma } from '@whizard/shared-infrastructure';
import type { Prisma } from '@prisma/client';
import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';
import type {
  IamTransactionContext,
  IamUnitOfWorkPort
} from '../../../../application/ports/transactions/iam-unit-of-work.port';

export interface OutboxCollectorContext extends IamTransactionContext {
  readonly tx: Prisma.TransactionClient;
  enqueueOutbox(event: IamEventEnvelope): void;
}

export class PrismaUnitOfWork implements IamUnitOfWorkPort {
  private readonly prisma = getPrisma();

  async execute<T>(work: (tx: IamTransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const transactionId = randomUUID();
      const outboxBuffer: IamEventEnvelope[] = [];

      const context: OutboxCollectorContext = {
        transactionId,
        tx,
        enqueueOutbox: (event) => {
          outboxBuffer.push(event);
        }
      };

      const result = await work(context);

      if (outboxBuffer.length > 0) {
        await tx.$executeRawUnsafe(
          `insert into iam.outbox_events (id, aggregate_type, aggregate_id, event_type, payload, status, occurred_at)
           select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::jsonb[], $6::text[], $7::timestamptz[])`,
          outboxBuffer.map(() => randomUUID()),
          outboxBuffer.map((event) => event.aggregateType),
          outboxBuffer.map((event) => event.aggregateId),
          outboxBuffer.map((event) => event.eventType),
          outboxBuffer.map((event) => JSON.stringify(event.payload ?? {})),
          outboxBuffer.map(() => 'PENDING'),
          outboxBuffer.map((event) => new Date(event.occurredAt))
        );
      }

      return result;
    });
  }
}
