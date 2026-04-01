import { createHash } from 'node:crypto';
import type { IdempotencyStorePort } from './idempotency-store.port';
import { deserializeIntegrationEventV1 } from '../serializers';

export interface KafkaMessageScaffold {
  readonly topic: string;
  readonly partition: number;
  readonly offset: string;
  readonly key: string;
  readonly value: string;
  readonly headers?: Readonly<Record<string, string | undefined>>;
}

export interface ConsumerProcessResult {
  readonly skippedAsDuplicate: boolean;
  readonly processed: boolean;
}

export abstract class IamConsumerScaffold {
  constructor(private readonly idempotencyStore: IdempotencyStorePort) {}

  async process(message: KafkaMessageScaffold): Promise<ConsumerProcessResult> {
    const idempotencyKey = this.resolveIdempotencyKey(message);
    if (await this.idempotencyStore.has(idempotencyKey)) {
      return { skippedAsDuplicate: true, processed: false };
    }

    const event = deserializeIntegrationEventV1(message.value);
    await this.handle(event, message);

    await this.idempotencyStore.put(idempotencyKey);
    return { skippedAsDuplicate: false, processed: true };
  }

  protected abstract handle(
    event: ReturnType<typeof deserializeIntegrationEventV1>,
    rawMessage: KafkaMessageScaffold
  ): Promise<void>;

  private resolveIdempotencyKey(message: KafkaMessageScaffold): string {
    const fromHeader = message.headers?.['x-idempotency-key'] ?? message.headers?.['x-event-id'];
    if (fromHeader) {
      return fromHeader;
    }

    const raw = `${message.topic}|${message.partition}|${message.offset}|${message.key}`;
    return createHash('sha256').update(raw).digest('hex');
  }
}
