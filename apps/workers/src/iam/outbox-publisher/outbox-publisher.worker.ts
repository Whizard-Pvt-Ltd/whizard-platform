import type { IamOutboxDispatcher } from '@whizard/identity-access';
import type { WorkerLogger } from '../shared/logger';
import { executeWithRetry } from '../shared/retry';

export interface OutboxPublisherWorkerOptions {
  readonly batchSize: number;
  readonly maxRetryCount: number;
}

export class OutboxPublisherWorker {
  constructor(
    private readonly dispatcher: IamOutboxDispatcher,
    private readonly logger: WorkerLogger,
    private readonly options: OutboxPublisherWorkerOptions
  ) {}

  async runOnce(): Promise<void> {
    const result = await executeWithRetry(
      () => this.dispatcher.dispatchBatch(this.options.batchSize),
      { attempts: 3, baseDelayMs: 250 },
      (error, attempt) => {
        this.logger.warn('Outbox dispatch retry', {
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    );

    this.logger.info('Outbox dispatch cycle completed', {
      attempted: result.attempted,
      published: result.published,
      failed: result.failed,
      routed: result.routed,
      maxRetryCount: this.options.maxRetryCount
    });
  }
}
