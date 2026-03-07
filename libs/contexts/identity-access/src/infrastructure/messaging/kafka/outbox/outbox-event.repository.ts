import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';

export interface OutboxDispatchEvent {
  readonly id: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
  readonly occurredAt: string;
  readonly retryCount: number;
}

export interface OutboxEventRepository {
  pullPending(limit: number): Promise<readonly OutboxDispatchEvent[]>;
  markPublished(eventId: string, publishedAt: Date): Promise<void>;
  markFailed(eventId: string, reason: string, failedAt: Date): Promise<void>;
  requeueFailed(maxRetryCount: number): Promise<number>;
}

export const toEventEnvelope = (event: OutboxDispatchEvent): IamEventEnvelope => ({
  eventType: event.eventType,
  aggregateType: event.aggregateType,
  aggregateId: event.aggregateId,
  occurredAt: event.occurredAt,
  payload: event.payload
});
