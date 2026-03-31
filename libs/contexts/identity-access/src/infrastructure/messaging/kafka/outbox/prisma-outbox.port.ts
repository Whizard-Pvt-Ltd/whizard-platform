import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';
import type { OutboxPort } from '../../../../application/ports/event-bus/outbox.port';

export class PrismaOutboxPort implements OutboxPort {
  async append(_events: IamEventEnvelope[]): Promise<void> {
    // no-op: outboxEvent table removed from schema
  }
}
