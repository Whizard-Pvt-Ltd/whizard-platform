import { isDirectExecution } from '../shared/direct-execution';
import { ConsoleWorkerLogger } from '../shared/logger';
import { runWorkerLoop } from '../shared/worker-loop';
import { createOutboxPublisherDependencies } from './dependencies';
import { OutboxPublisherWorker } from './outbox-publisher.worker';

export const startIamOutboxPublisher = async (): Promise<void> => {
  const logger = new ConsoleWorkerLogger('iam.outbox-publisher');
  const deps = createOutboxPublisherDependencies();

  const worker = new OutboxPublisherWorker(deps.dispatcher, logger, {
    batchSize: Number(process.env.IAM_OUTBOX_BATCH_SIZE ?? 100),
    maxRetryCount: Number(process.env.IAM_OUTBOX_MAX_RETRY_COUNT ?? 10)
  });

  await runWorkerLoop(
    'iam.outbox-publisher',
    () => worker.runOnce(),
    {
      intervalMs: Number(process.env.IAM_OUTBOX_POLL_INTERVAL_MS ?? 2000),
      runOnce: process.env.IAM_WORKER_RUN_ONCE === 'true'
    },
    logger
  );
};

if (isDirectExecution()) {
  void startIamOutboxPublisher();
}
