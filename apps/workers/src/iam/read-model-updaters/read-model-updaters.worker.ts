import type { IamIntegrationEventV1 } from '@whizard/identity-access';
import type { WorkerLogger } from '../shared/logger';
import type { ReadModelUpdaterDependencies } from './dependencies';
import { executeWithRetry } from '../shared/retry';

export class ReadModelUpdatersWorker {
  constructor(
    private readonly deps: ReadModelUpdaterDependencies,
    private readonly logger: WorkerLogger,
    private readonly batchSize: number
  ) {}

  async runOnce(): Promise<void> {
    const events = await this.deps.subscription.pull(this.batchSize);

    for (const event of events) {
      await this.projectAndAcknowledge(event);
    }

    this.logger.info('Read model updater cycle completed', {
      pulled: events.length,
      batchSize: this.batchSize
    });
  }

  private async projectAndAcknowledge(event: IamIntegrationEventV1): Promise<void> {
    await executeWithRetry(
      async () => {
        await Promise.all([
          this.deps.adminProjector.project(event),
          this.deps.auditProjector.project(event)
        ]);
        await this.deps.subscription.acknowledge(event.eventId);
      },
      { attempts: 3, baseDelayMs: 200 },
      (error, attempt) => {
        this.logger.warn('Read model projection retry', {
          attempt,
          eventId: event.eventId,
          eventType: event.eventType,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    );
  }
}
