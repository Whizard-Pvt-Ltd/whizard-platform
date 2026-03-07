import type { WorkerLogger } from '../shared/logger';
import { executeWithRetry } from '../shared/retry';
import type {
  ProvisioningSyncDependencies,
  DeactivationFeedRecord
} from './dependencies';

export class ProvisioningSyncWorker {
  constructor(
    private readonly deps: ProvisioningSyncDependencies,
    private readonly logger: WorkerLogger
  ) {}

  async runOnce(): Promise<void> {
    const checkpoint = await this.deps.checkpointStore.get();
    const feedItems = await executeWithRetry(
      () => this.deps.feedClient.fetchSince(checkpoint),
      { attempts: 3, baseDelayMs: 300 },
      (error, attempt) => {
        this.logger.warn('Provisioning feed fetch retry', {
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    );

    for (const item of feedItems) {
      await this.processFeedItem(item);
      await this.deps.checkpointStore.save(item.occurredAt);
    }

    this.logger.info('Provisioning sync cycle completed', {
      fetched: feedItems.length,
      checkpointBefore: checkpoint,
      checkpointAfter: feedItems.length ? feedItems[feedItems.length - 1].occurredAt : checkpoint
    });
  }

  private async processFeedItem(item: DeactivationFeedRecord): Promise<void> {
    await executeWithRetry(
      () =>
        this.deps.executor.deprovision({
          request: {
            actorUserAccountId: 'iam.provisioning-sync-worker',
            tenantType: item.tenantType,
            tenantId: item.tenantId,
            payload: {
              externalUserId: item.externalUserId,
              reason: item.reason,
              source: 'hrms-erp-feed'
            }
          }
        }),
      { attempts: 3, baseDelayMs: 300 },
      (error, attempt) => {
        this.logger.warn('Provisioning deprovision retry', {
          attempt,
          externalUserId: item.externalUserId,
          tenantId: item.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    );
  }
}
