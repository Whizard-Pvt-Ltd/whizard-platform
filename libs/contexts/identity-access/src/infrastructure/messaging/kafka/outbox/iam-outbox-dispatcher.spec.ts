import { describe, expect, it } from 'vitest';
import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';
import type { KafkaProducerPort } from '../producers/kafka-producer.port';
import type { OutboxDispatchEvent, OutboxEventRepository } from './outbox-event.repository';
import { IamTopicPublisher } from '../producers/iam-topic.publisher';
import { IamOutboxDispatcher } from './iam-outbox-dispatcher';

class InMemoryOutboxEventRepository implements OutboxEventRepository {
  public readonly published: string[] = [];
  public readonly failed: string[] = [];

  constructor(private readonly events: OutboxDispatchEvent[]) {}

  async pullPending(): Promise<readonly OutboxDispatchEvent[]> {
    return this.events;
  }

  async markPublished(eventId: string): Promise<void> {
    this.published.push(eventId);
  }

  async markFailed(eventId: string): Promise<void> {
    this.failed.push(eventId);
  }

  async requeueFailed(): Promise<number> {
    return 0;
  }
}

class InMemoryKafkaProducer implements KafkaProducerPort {
  public readonly messages: Array<{ topic: string; event: IamEventEnvelope }> = [];

  async send(input: {
    topic: string;
    messages: readonly { key: string; value: string; headers?: Readonly<Record<string, string>> }[];
  }): Promise<void> {
    for (const message of input.messages) {
      const event = JSON.parse(message.value) as IamEventEnvelope;
      this.messages.push({ topic: input.topic, event });
    }
  }
}

describe('IamOutboxDispatcher', () => {
  it('publishes pending events and marks them published', async () => {
    const repo = new InMemoryOutboxEventRepository([
      {
        id: 'evt-1',
        eventType: 'iam.session-started.v1',
        aggregateType: 'UserSession',
        aggregateId: 's-1',
        payload: {},
        occurredAt: new Date().toISOString(),
        retryCount: 0
      }
    ]);

    const producer = new InMemoryKafkaProducer();
    const publisher = new IamTopicPublisher(producer);
    const dispatcher = new IamOutboxDispatcher(repo, publisher);

    const result = await dispatcher.dispatchBatch(10);

    expect(result.published).toBe(1);
    expect(result.failed).toBe(0);
    expect(producer.messages[0]?.topic).toBe('iam.session-events.v1');
    expect(repo.published).toEqual(['evt-1']);
  });
});
