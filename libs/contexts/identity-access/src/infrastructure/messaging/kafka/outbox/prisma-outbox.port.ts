import type { OutboxPort } from '../../../../application/ports/event-bus/outbox.port';
import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';

export class PrismaOutboxPort implements OutboxPort {
  async append(_events: IamEventEnvelope[]): Promise<void> {
    // no-op: outboxEvent table removed from schema
  }
}
