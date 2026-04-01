import type { IamTopicPublisher } from '../producers';
import type { IamTopic } from '../topic-bindings';
import type { OutboxEventRepository } from './outbox-event.repository';
import { getIamTopicForEventType } from '../topic-bindings';
import { toEventEnvelope } from './outbox-event.repository';

export interface OutboxDispatchResult {
  readonly attempted: number;
  readonly published: number;
  readonly failed: number;
  readonly routed: Readonly<Record<IamTopic, number>>;
}

export class IamOutboxDispatcher {
  constructor(
    private readonly outboxRepository: OutboxEventRepository,
    private readonly publisher: IamTopicPublisher
  ) {}

  async dispatchBatch(batchSize: number = 100): Promise<OutboxDispatchResult> {
    const pending = await this.outboxRepository.pullPending(batchSize);

    const routed: Record<IamTopic, number> = {
      'iam.user-account-events.v1': 0,
      'iam.access-events.v1': 0,
      'iam.session-events.v1': 0,
      'iam.federation-events.v1': 0,
      'iam.provisioning-events.v1': 0
    };

    let published = 0;
    let failed = 0;

    for (const event of pending) {
      try {
        const topic = getIamTopicForEventType(event.eventType);
        if (!topic) {
          throw new Error(`No topic route for ${event.eventType}`);
        }

        await this.publisher.publish(topic, toEventEnvelope(event));
        await this.outboxRepository.markPublished(event.id, new Date());

        routed[topic] += 1;
        published += 1;
      } catch (error) {
        failed += 1;
        const reason = error instanceof Error ? error.message : 'Unknown dispatcher failure';
        await this.outboxRepository.markFailed(event.id, reason, new Date());
      }
    }

    return {
      attempted: pending.length,
      published,
      failed,
      routed
    };
  }
}
