import type { Prisma } from '@prisma/client';
import { getPrisma } from '@whizard/shared-infrastructure';
import type { OutboxPort } from '../../../../application/ports/event-bus/outbox.port';
import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';

export class PrismaOutboxPort implements OutboxPort {
  private readonly prisma = getPrisma();

  async append(events: IamEventEnvelope[]): Promise<void> {
    if (!events.length) {
      return;
    }

    await this.prisma.outboxEvent.createMany({
      data: events.map((event) => ({
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload as Prisma.InputJsonValue,
        occurredAt: new Date(event.occurredAt)
      }))
    });
  }
}
